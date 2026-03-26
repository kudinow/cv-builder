import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// Handle magic link callback from Supabase Auth
// Supports both PKCE flow (code param) and token hash flow (token_hash param)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "magiclink";
  const next = searchParams.get("next") ?? "/dashboard";

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (code) {
    // PKCE flow — works when same browser
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (token_hash) {
    // Token hash flow — works cross-browser (e.g. Telegram → Safari)
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email",
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
