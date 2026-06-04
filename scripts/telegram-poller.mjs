// scripts/telegram-poller.mjs
//
// Long-polling worker for the Telegram bot.
//
// WHY: the prod VM sits behind an RKN-style network block of Telegram's IP
// ranges — in BOTH directions. Outbound is worked around by pinning
// api.telegram.org to a reachable Telegram IP in /etc/hosts, but INBOUND
// webhook delivery from Telegram's servers is dropped before it reaches nginx
// (Telegram → VM times out, updates pile up as pending). We therefore cannot
// use webhooks. Instead this worker PULLS updates via getUpdates (outbound,
// which works through the pinned IP) and forwards each one to the existing
// /api/telegram/webhook handler on localhost, so all auth/support/admin logic
// is reused unchanged.
//
// Run under PM2 alongside the Next.js app:
//   pm2 start scripts/telegram-poller.mjs --name tg-poller
//
// See resume-ai/CLAUDE.md "Telegram egress" and the project memory for context.

import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── Load env from .env.local (same file the app uses), without extra deps ──
function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (env[m[1]] === undefined) env[m[1]] = val;
    }
  } catch {
    // No .env.local — rely on process.env only.
  }
  return env;
}

const env = loadEnv();
const TOKEN = env.TELEGRAM_BOT_TOKEN;
const SECRET = env.TELEGRAM_WEBHOOK_SECRET;
const PORT = env.PORT || "3000";
const WEBHOOK_URL =
  env.TELEGRAM_LOCAL_WEBHOOK_URL ||
  `http://127.0.0.1:${PORT}/api/telegram/webhook`;
const API = "https://api.telegram.org";

if (!TOKEN) {
  console.error("[tg-poller] TELEGRAM_BOT_TOKEN is not set — exiting");
  process.exit(1);
}
if (!SECRET) {
  console.error("[tg-poller] TELEGRAM_WEBHOOK_SECRET is not set — exiting");
  process.exit(1);
}

function log(...args) {
  console.log("[tg-poller]", ...args);
}

async function tg(method, params) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 45_000);
  try {
    const res = await fetch(`${API}/bot${TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params ?? {}),
      signal: ac.signal,
    });
    const json = await res.json();
    if (!json.ok) throw new Error(`${method} not-ok: ${json.description}`);
    return json.result;
  } finally {
    clearTimeout(timer);
  }
}

// Forward one update to the existing webhook handler on localhost.
async function forward(update) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 30_000);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": SECRET,
      },
      body: JSON.stringify(update),
      signal: ac.signal,
    });
    if (!res.ok) {
      log(`webhook returned ${res.status} for update ${update.update_id}`);
    }
  } catch (e) {
    log(`forward failed for update ${update.update_id}:`, e?.message || e);
  } finally {
    clearTimeout(timer);
  }
}

let running = true;
process.on("SIGTERM", () => {
  running = false;
});
process.on("SIGINT", () => {
  running = false;
});

async function main() {
  log(`starting; forwarding to ${WEBHOOK_URL}`);

  // getUpdates and a webhook are mutually exclusive — drop the webhook but KEEP
  // any pending updates so the queued messages get processed via polling.
  try {
    await tg("deleteWebhook", { drop_pending_updates: false });
    log("webhook deleted; switching to long polling");
  } catch (e) {
    log("deleteWebhook failed (will still try getUpdates):", e?.message || e);
  }

  let offset = 0;
  let backoff = 1000;

  while (running) {
    try {
      const updates = await tg("getUpdates", {
        offset,
        timeout: 30,
        allowed_updates: ["message"],
      });
      backoff = 1000; // reset after a successful poll
      for (const update of updates) {
        await forward(update);
        offset = update.update_id + 1;
      }
    } catch (e) {
      log("getUpdates error:", e?.message || e, `— retrying in ${backoff}ms`);
      await new Promise((r) => setTimeout(r, backoff));
      backoff = Math.min(backoff * 2, 30_000); // exponential backoff, capped
    }
  }

  log("stopped");
  process.exit(0);
}

main();
