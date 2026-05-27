// resume-ai/app/api/auth/telegram/status/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Fix #3: helper that injects Cache-Control: no-store on every response
function json(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return json({ error: "missing_token" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  const { data: row, error } = await admin
    .from("telegram_auth_requests")
    .select("status, expires_at, auth_token_hash")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error("telegram/status select failed", error);
    return json({ error: "db_error" }, { status: 500 });
  }
  if (!row) {
    return json({ error: "not_found" }, { status: 404 });
  }

  const now = Date.now();
  const expired = new Date(row.expires_at).getTime() < now;

  if (row.status === "pending" && expired) {
    // Fix #1: handle UPDATE error instead of silently swallowing it
    const { error: expErr } = await admin
      .from("telegram_auth_requests")
      .update({ status: "expired" })
      .eq("token", token)
      .eq("status", "pending");
    if (expErr) {
      console.error("telegram/status expire failed", expErr);
      return json({ error: "db_error" }, { status: 500 });
    }
    return json({ status: "expired" });
  }

  if (row.status === "pending") {
    return json({ status: "pending" });
  }

  if (row.status === "expired") {
    return json({ status: "expired" });
  }

  if (row.status === "consumed") {
    return json({ status: "consumed" });
  }

  // Fix #2: guard against unknown statuses before the ready UPDATE
  if (row.status !== "ready") {
    console.error("telegram/status unknown status", row.status);
    return json({ error: "unknown_status" }, { status: 500 });
  }

  // status === "ready": atomically переводим в consumed и отдаём token_hash один раз
  const { data: claimed, error: updErr } = await admin
    .from("telegram_auth_requests")
    .update({ status: "consumed", consumed_at: new Date().toISOString() })
    .eq("token", token)
    .eq("status", "ready")
    .select("auth_token_hash")
    .maybeSingle();

  if (updErr) {
    console.error("telegram/status claim failed", updErr);
    return json({ error: "db_error" }, { status: 500 });
  }
  if (!claimed) {
    // Кто-то опередил — токен уже consumed
    return json({ status: "consumed" });
  }

  return json({
    status: "ready",
    token_hash: claimed.auth_token_hash,
  });
}
