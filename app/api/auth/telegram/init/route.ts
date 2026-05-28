import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { buildDeepLink, generateAuthToken } from "@/lib/telegram";

export const runtime = "nodejs";

type InitBody = {
  consent_privacy?: boolean;
  consent_marketing?: boolean;
  promo_code?: string;
};

export async function POST(request: Request) {
  let body: InitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.consent_privacy !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  if (!botUsername) {
    return NextResponse.json({ error: "bot_not_configured" }, { status: 500 });
  }

  const token = generateAuthToken();
  const admin = createSupabaseAdmin();

  const { error } = await admin.from("telegram_auth_requests").insert({
    token,
    status: "pending",
    consent_privacy: true,
    consent_marketing: !!body.consent_marketing,
    promo_code: body.promo_code || null,
    full_name: null,
    intent: "register",
  });

  if (error) {
    console.error("telegram/init insert failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({
    token,
    deep_link: buildDeepLink(botUsername, token),
  });
}
