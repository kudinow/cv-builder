const API = "https://api.telegram.org";

function apiUrl(method: string): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return `${API}/bot${token}/${method}`;
}

async function callApi<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(apiUrl(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Telegram ${method} failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { ok: boolean; result: T; description?: string };
  if (!json.ok) throw new Error(`Telegram ${method} returned not-ok: ${json.description}`);
  return json.result;
}

/** Sends a plain text message. Returns the new message_id. */
export async function sendMessage(chatId: number, text: string): Promise<number> {
  const result = await callApi<{ message_id: number }>("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  });
  return result.message_id;
}

/** Copies a message from one chat to another. Returns the new message_id. */
export async function copyMessage(
  fromChatId: number,
  toChatId: number,
  messageId: number
): Promise<number> {
  const result = await callApi<{ message_id: number }>("copyMessage", {
    from_chat_id: fromChatId,
    chat_id: toChatId,
    message_id: messageId,
  });
  return result.message_id;
}

/**
 * Fire-and-forget notification to the admin chat.
 * Silently no-ops if TELEGRAM_ADMIN_CHAT_ID is not configured.
 * Never throws — callers should not have to wrap this.
 */
export async function notifyAdmin(text: string): Promise<void> {
  const adminChatRaw = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatRaw) return;
  const adminChat = Number(adminChatRaw);
  if (!Number.isFinite(adminChat)) {
    console.error("TELEGRAM_ADMIN_CHAT_ID is not a number:", adminChatRaw);
    return;
  }
  try {
    await sendMessage(adminChat, text);
  } catch (e) {
    console.error("notifyAdmin failed:", e);
  }
}

/** Exported for callers that need the parsed admin chat id (router). */
export function getAdminChatId(): number | null {
  const raw = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
