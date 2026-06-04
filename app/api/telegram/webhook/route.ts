// resume-ai/app/api/telegram/webhook/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { parseStartPayload, telegramEmail } from "@/lib/telegram";
import { generateMagicLinkTokenHash } from "@/lib/telegram-magic-link";
import * as bot from "@/lib/telegram-bot";
import { relayUserToAdmin, relayAdminToUser } from "@/lib/telegram-support";

export const runtime = "nodejs";

const WELCOME_TEXT =
  "Это бот авторизации и поддержки CV Builder.\nДля входа: cv-builder.ru/auth → Войти через Telegram.\nЛюбое сообщение здесь попадёт в поддержку.";

type TgUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type TgMessage = {
  message_id: number;
  text?: string;
  from?: TgUser;
  chat?: { id: number };
  reply_to_message?: { message_id: number };
};

type TgUpdate = {
  message?: TgMessage;
};

async function sendBotMessage(chatId: number, text: string) {
  try {
    await bot.sendMessage(chatId, text);
  } catch (e) {
    console.error("sendBotMessage failed", e);
  }
}

export async function POST(request: Request) {
  // 1. Verify secret
  const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || headerSecret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. Parse update
  let update: TgUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  const text = message?.text;
  const chatId = message?.chat?.id;
  const from = message?.from;
  const messageId = message?.message_id;

  if (!chatId || !from || !messageId) {
    console.log("telegram/webhook ignored update", { keys: Object.keys(update ?? {}) });
    return NextResponse.json({ ok: true });
  }

  const adminChatId = bot.getAdminChatId();

  try {
    const admin = createSupabaseAdmin();

    // ─── 3. Admin-chat routing (must come BEFORE generic /start handling) ───
    if (adminChatId !== null && chatId === adminChatId) {
      const replyTo = message?.reply_to_message?.message_id;
      if (replyTo) {
        await relayAdminToUser(
          { adminChatId, replyMessageId: replyTo, adminReplyMessageId: messageId },
          { admin, bot }
        );
        return NextResponse.json({ ok: true });
      }
      // The admin's private chat_id == TELEGRAM_ADMIN_CHAT_ID, so the admin's own
      // /start lands here too. Let the admin use the bot as a regular user for
      // /start (auth deep link + welcome). Any other non-reply text is a silent
      // no-op — otherwise we'd relay the admin's messages back to themselves.
      const adminPayload = text ? parseStartPayload(text) : null;
      if (adminPayload) {
        await handleAuthStart({ admin, chatId, from, payload: adminPayload });
      } else if (text && text.startsWith("/start")) {
        await sendBotMessage(chatId, WELCOME_TEXT);
      }
      return NextResponse.json({ ok: true });
    }

    // ─── 4. /start <token> — existing auth flow ───
    const payload = text ? parseStartPayload(text) : null;

    if (text && text.startsWith("/start") && !payload) {
      await sendBotMessage(chatId, WELCOME_TEXT);
      return NextResponse.json({ ok: true });
    }

    if (payload) {
      await handleAuthStart({ admin, chatId, from, payload });
      return NextResponse.json({ ok: true });
    }

    // ─── 5. Anything else from a user → support relay ───
    if (adminChatId === null) {
      // No admin configured — we can't relay. Silently acknowledge to avoid TG retries.
      console.warn("support message received but TELEGRAM_ADMIN_CHAT_ID is not set");
      return NextResponse.json({ ok: true });
    }

    await relayUserToAdmin(
      { fromChatId: chatId, messageId, from },
      { adminChatId, admin, bot }
    );
    await sendBotMessage(chatId, "✓ Передал в поддержку, отвечу в течение дня.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook error", e);
    return NextResponse.json({ ok: true });
  }
}

// ───────────────────────── Auth flow (existing logic, extracted) ─────────────────────────

async function handleAuthStart(args: {
  admin: ReturnType<typeof createSupabaseAdmin>;
  chatId: number;
  from: TgUser;
  payload: string;
}) {
  const { admin, chatId, from, payload } = args;

  const { data: req } = await admin
    .from("telegram_auth_requests")
    .select("status, expires_at, full_name, consent_privacy, consent_marketing, promo_code")
    .eq("token", payload)
    .maybeSingle();

  if (!req) {
    await sendBotMessage(
      chatId,
      "Эта ссылка не найдена. Вернитесь на cv-builder.ru/auth и попробуйте ещё раз."
    );
    return;
  }

  const expired =
    req.status === "pending" && new Date(req.expires_at).getTime() < Date.now();
  if (expired || req.status === "expired" || req.status === "consumed") {
    await sendBotMessage(
      chatId,
      "Эта ссылка устарела. Вернитесь на cv-builder.ru/auth и попробуйте ещё раз."
    );
    return;
  }

  if (req.status === "ready") {
    await sendBotMessage(chatId, "✅ Уже готово, вернитесь на сайт.");
    return;
  }

  const tgId = from.id;
  const email = telegramEmail(tgId);

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("telegram_id", tgId)
    .maybeSingle();

  let authUserId: string;
  let isNewRegistration = false;

  if (existing) {
    authUserId = existing.id;
  } else {
    const fullName = req.full_name || from.first_name || from.username || "";
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        telegram_id: String(tgId),
        telegram_username: from.username || null,
        consent_privacy: req.consent_privacy,
        consent_marketing: req.consent_marketing,
        promo_code: req.promo_code || undefined,
        auth_provider: "telegram",
      },
    });
    if (createErr || !created.user) {
      console.error("createUser failed", createErr);
      await sendBotMessage(chatId, "Ошибка регистрации. Попробуйте позже.");
      return;
    }
    authUserId = created.user.id;
    isNewRegistration = true;
  }

  let tokenHash: string;
  try {
    tokenHash = await generateMagicLinkTokenHash(admin, email);
  } catch (e) {
    console.error("generateMagicLinkTokenHash failed", { tgId, e });
    await sendBotMessage(chatId, "Ошибка. Попробуйте позже.");
    return;
  }

  const { data: updated, error: updErr } = await admin
    .from("telegram_auth_requests")
    .update({
      status: "ready",
      telegram_id: tgId,
      auth_user_id: authUserId,
      auth_token_hash: tokenHash,
    })
    .eq("token", payload)
    .eq("status", "pending")
    .select("token")
    .maybeSingle();

  if (updErr) {
    console.error("update to ready failed", updErr);
    await sendBotMessage(chatId, "Ошибка. Попробуйте позже.");
    return;
  }

  if (!updated) {
    await sendBotMessage(chatId, "Ссылка уже использована или устарела.");
    return;
  }

  await sendBotMessage(
    chatId,
    "✅ Готово! Вернитесь на cv-builder.ru — сайт автоматически вас залогинит."
  );

  if (isNewRegistration) {
    const handle = from.username ? `@${from.username}` : "(без username)";
    const name = req.full_name || [from.first_name, from.last_name].filter(Boolean).join(" ") || "—";
    const privacy = req.consent_privacy ? "✅" : "❌";
    const marketing = req.consent_marketing ? "✅" : "❌";
    const promoLine = req.promo_code ? `\nПромо: ${req.promo_code}` : "";
    await bot.notifyAdmin(
      `🎉 Новая регистрация\n${handle} (${name})\ntg_id: ${tgId}${promoLine}\nСогласия: privacy ${privacy}, marketing ${marketing}`
    );
  }
}
