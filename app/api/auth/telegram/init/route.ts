// resume-ai/app/api/auth/telegram/init/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { buildDeepLink, generateAuthToken } from "@/lib/telegram";

export const runtime = "nodejs";

type InitBody = {
  intent?: "login" | "register";
  consent_privacy?: boolean;
  consent_marketing?: boolean;
  promo_code?: string;
  full_name?: string;
};

export async function POST(request: Request) {
  let body: InitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const intent = body.intent;
  if (intent !== "login" && intent !== "register") {
    return NextResponse.json({ error: "invalid_intent" }, { status: 400 });
  }
  if (body.consent_privacy !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }
  if (intent === "register" && (!body.full_name || !body.full_name.trim())) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
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
    consent_marketing: intent === "register" ? !!body.consent_marketing : false,
    promo_code: intent === "register" ? (body.promo_code || null) : null,
    full_name: intent === "register" ? (body.full_name?.trim() || null) : null,
    intent,
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
