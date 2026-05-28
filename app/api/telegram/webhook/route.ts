// resume-ai/app/api/telegram/webhook/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { parseStartPayload, telegramEmail } from "@/lib/telegram";
import { generateMagicLinkTokenHash } from "@/lib/telegram-magic-link";

export const runtime = "nodejs";

type TgUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type TgUpdate = {
  message?: {
    text?: string;
    from?: TgUser;
    chat?: { id: number };
  };
};

async function sendBotMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch (e) {
    console.error("sendBotMessage failed", e);
  }
}

export async function POST(request: Request) {
  // 1. Проверяем секрет
  const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || headerSecret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. Парсим апдейт
  let update: TgUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: true }); // молча 200, чтобы TG не ретраил
  }

  const text = update.message?.text;
  const chatId = update.message?.chat?.id;
  const from = update.message?.from;

  if (!text || !chatId || !from) {
    console.log("telegram/webhook ignored update", { keys: Object.keys(update ?? {}) });
    return NextResponse.json({ ok: true });
  }

  const payload = parseStartPayload(text);

  // /start без аргумента — приветствие
  if (text.startsWith("/start") && !payload) {
    await sendBotMessage(
      chatId,
      "Это бот авторизации и поддержки CV Builder.\nДля входа: cv-builder.ru/auth → Войти через Telegram."
    );
    return NextResponse.json({ ok: true });
  }

  // Любое сообщение, не /start <token>, игнорируем тихо
  if (!payload) {
    return NextResponse.json({ ok: true });
  }

  try {
    const admin = createSupabaseAdmin();

    // 3. Lookup запроса
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
      return NextResponse.json({ ok: true });
    }

    const expired =
      req.status === "pending" && new Date(req.expires_at).getTime() < Date.now();
    if (expired || req.status === "expired" || req.status === "consumed") {
      await sendBotMessage(
        chatId,
        "Эта ссылка устарела. Вернитесь на cv-builder.ru/auth и попробуйте ещё раз."
      );
      return NextResponse.json({ ok: true });
    }

    if (req.status === "ready") {
      // Идемпотентно: юзер дважды нажал Start
      await sendBotMessage(chatId, "✅ Уже готово, вернитесь на сайт.");
      return NextResponse.json({ ok: true });
    }

    // status === "pending": создаём/находим юзера
    const tgId = from.id;
    const email = telegramEmail(tgId);

    // Ищем существующий profile по telegram_id
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("telegram_id", tgId)
      .maybeSingle();

    let authUserId: string;

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
        return NextResponse.json({ ok: true });
      }
      authUserId = created.user.id;
    }

    // Генерим magic link → token_hash
    let tokenHash: string;
    try {
      tokenHash = await generateMagicLinkTokenHash(admin, email);
    } catch (e) {
      console.error("generateMagicLinkTokenHash failed", { tgId, e });
      await sendBotMessage(chatId, "Ошибка. Попробуйте позже.");
      return NextResponse.json({ ok: true });
    }

    // Атомарно переводим pending → ready
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
      return NextResponse.json({ ok: true });
    }

    if (!updated) {
      // Состояние изменилось между чтением и записью
      await sendBotMessage(chatId, "Ссылка уже использована или устарела.");
      return NextResponse.json({ ok: true });
    }

    await sendBotMessage(
      chatId,
      "✅ Готово! Вернитесь на cv-builder.ru — сайт автоматически вас залогинит."
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook error", e);
    return NextResponse.json({ ok: true }); // никогда не даём TG ретраить
  }
}
