import type { SupabaseClient } from "@supabase/supabase-js";
import * as telegramBot from "./telegram-bot";

export type TelegramFrom = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export type IncomingUserMessage = {
  fromChatId: number;
  messageId: number;
  from: TelegramFrom;
};

export type AdminReply = {
  adminChatId: number;
  /** message_id of the message the admin replied TO (i.e. our forwarded card or copy). */
  replyMessageId: number;
  /** message_id of the admin's reply message itself (what we will copyMessage from). */
  adminReplyMessageId: number;
};

type SupportDeps = {
  admin: SupabaseClient;
  bot: Pick<typeof telegramBot, "sendMessage" | "copyMessage">;
};

function formatUserCard(
  from: TelegramFrom,
  profile: { full_name?: string | null; tokens?: number | null } | null
): string {
  const handle = from.username ? `@${from.username}` : "(без username)";
  const displayName = profile?.full_name || [from.first_name, from.last_name].filter(Boolean).join(" ") || "—";
  const lines = [
    `💬 Сообщение от ${handle}`,
    `Имя: ${displayName}`,
    `tg_id: ${from.id}`,
  ];
  if (profile && typeof profile.tokens === "number") {
    lines.push(`Баланс: ${profile.tokens} токенов`);
  }
  return lines.join("\n");
}

/**
 * Relays a user's message to the admin chat:
 * 1) Sends a header card with profile context.
 * 2) Copies the user's actual message under it.
 * 3) Writes both message_ids to telegram_support_messages so admin can Reply to either.
 */
export async function relayUserToAdmin(
  message: IncomingUserMessage,
  ctx: SupportDeps & { adminChatId: number }
): Promise<void> {
  const { admin, bot, adminChatId } = ctx;

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, tokens")
    .eq("telegram_id", message.from.id)
    .maybeSingle();

  const cardText = formatUserCard(message.from, profile ?? null);
  const cardId = await bot.sendMessage(adminChatId, cardText);
  const copyId = await bot.copyMessage(message.fromChatId, adminChatId, message.messageId);

  await admin.from("telegram_support_messages").insert({
    admin_message_id: cardId,
    user_chat_id: message.fromChatId,
    user_telegram_id: message.from.id,
    direction: "inbound",
  });
  await admin.from("telegram_support_messages").insert({
    admin_message_id: copyId,
    user_chat_id: message.fromChatId,
    user_telegram_id: message.from.id,
    direction: "inbound",
  });
}

/**
 * Relays an admin Reply back to the user it concerns.
 * Looks up the mapping by reply_to_message.message_id.
 * If no mapping found — tells admin so.
 */
export async function relayAdminToUser(
  reply: AdminReply,
  ctx: SupportDeps
): Promise<void> {
  const { admin, bot } = ctx;
  const { adminChatId, replyMessageId, adminReplyMessageId } = reply;

  const { data: mapping } = await admin
    .from("telegram_support_messages")
    .select("user_chat_id, user_telegram_id")
    .eq("admin_message_id", replyMessageId)
    .maybeSingle();

  if (!mapping) {
    await bot.sendMessage(adminChatId, "⚠️ Не нашёл, кому отвечать.");
    return;
  }

  await bot.copyMessage(adminChatId, mapping.user_chat_id, adminReplyMessageId);

  await admin.from("telegram_support_messages").insert({
    admin_message_id: adminReplyMessageId,
    user_chat_id: mapping.user_chat_id,
    user_telegram_id: mapping.user_telegram_id,
    direction: "outbound",
  });
}
