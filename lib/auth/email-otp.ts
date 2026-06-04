/** Seconds the "resend code" action stays disabled after a send. */
export const RESEND_COOLDOWN_SECONDS = 60;

/** Lightweight email shape check (trims first). Not RFC-exhaustive by design. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

type OtpErrorLike = { message?: string; status?: number; code?: string } | null;

/** Maps a Supabase auth error to a user-facing Russian message. "" when no error. */
export function mapOtpError(error: OtpErrorLike): string {
  if (!error) return "";
  const code = error.code ?? "";
  const message = error.message ?? "";

  if (error.status === 429 || code.includes("rate") || code === "over_email_send_rate_limit") {
    return "Слишком часто, попробуйте через минуту.";
  }
  if (code === "otp_expired" || /expired|invalid/i.test(message)) {
    return "Неверный или устаревший код, запросите новый.";
  }
  return "Что-то пошло не так. Попробуйте ещё раз.";
}
