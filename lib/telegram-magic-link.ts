import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Из action_link Supabase достаёт token_hash (Supabase кладёт его как
 * query-параметр `token` или `token_hash` в зависимости от версии).
 */
export function extractTokenHash(actionLink: string): string {
  const url = new URL(actionLink);
  const hash = url.searchParams.get("token_hash") ?? url.searchParams.get("token");
  if (!hash) throw new Error(`No token_hash in action_link: ${actionLink}`);
  return hash;
}

/**
 * Генерит magic link для email через admin API и возвращает token_hash,
 * пригодный для /callback?token_hash=...&type=magiclink. Письмо не отправляется,
 * т.к. admin.generateLink не шлёт почту по умолчанию.
 */
export async function generateMagicLinkTokenHash(
  admin: SupabaseClient,
  email: string
): Promise<string> {
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error) throw error;
  const actionLink = data?.properties?.action_link;
  if (!actionLink) throw new Error("Supabase did not return action_link");
  return extractTokenHash(actionLink);
}
