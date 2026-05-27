import { randomBytes } from "crypto";

/** Одноразовый токен для deep link (256 бит, url-safe base64, 43 символа). */
export function generateAuthToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Извлекает аргумент команды `/start <payload>` из текста сообщения. */
export function parseStartPayload(text: string): string | null {
  const m = text.match(/^\/start(?:\s+(.+))?\s*$/);
  if (!m) return null;
  const payload = m[1]?.trim();
  return payload && payload.length > 0 ? payload : null;
}

/** Собирает deep link вида https://t.me/<bot>?start=<token>. */
export function buildDeepLink(botUsername: string, token: string): string {
  return `https://t.me/${botUsername}?start=${token}`;
}

/** Формирует фейковый email для Supabase Auth по telegram_id. */
export function telegramEmail(telegramId: number | bigint): string {
  return `tg-${telegramId}@telegram.cv-builder.ru`;
}
