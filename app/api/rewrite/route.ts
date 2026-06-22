import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { buildRewritePrompt } from "@/lib/prompts/rewrite-line";
import { SEGMENTS, isSegmentId, type SegmentId } from "@/lib/landing-segments";

export const runtime = "nodejs";

// ── Tunables ──────────────────────────────────────────────────────────────
const MAX_LINE = 200; // chars
const RATE_LIMIT = 5; // requests
const RATE_WINDOW_MS = 60_000; // per minute, per IP
const LLM_TIMEOUT_MS = 10_000;
const MAX_OUTPUT_TOKENS = 200;
const OUTPUT_CHAR_CAP = 280;
const CACHE_TTL_MS = 30 * 60_000;

const NEUTRAL =
  "Кажется, это не похоже на строчку из резюме. Введи, что ты делал и какой был результат — например: «вёл рекламу и привлекал клиентов».";

// ── In-memory state (per server instance; fine for a public demo) ──────────
const rateHits = new Map<string, number[]>();
const cache = new Map<string, { result: string; at: number }>();

function getIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    rateHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateHits.set(ip, hits);
  return false;
}

// Profanity / prompt-injection / junk filter. Keep deliberately conservative —
// the LLM prompt itself also handles nonsense, this just avoids paying for
// obvious abuse and blocks injection attempts.
const BAD_PATTERNS: RegExp[] = [
  /\b(хуй|пизд|еба|бляд|сука|муд[аио]|залуп|пидор|гандон)/i,
  /\b(fuck|shit|bitch|asshole)\b/i,
  /(ignore|forget|disregard)\s+(all\s+)?(previous|prior|above)/i,
  /(игнорир|забуд|не\s+обращай).{0,20}(инструкц|правил|систем|промпт)/i,
  /(system\s+prompt|твой\s+промпт|твои\s+инструкции|act\s+as|veди\s+себя\s+как)/i,
];

function looksLikeJunk(line: string): boolean {
  if (BAD_PATTERNS.some((re) => re.test(line))) return true;
  // No letters at all (only digits/punctuation/emoji) → junk.
  if (!/[a-zA-Zа-яА-ЯёЁ]/.test(line)) return true;
  // Single repeated char spam, e.g. "ааааааа".
  if (/^(.)\1{6,}$/.test(line.replace(/\s/g, ""))) return true;
  return false;
}

function pickFallback(segment: SegmentId): string {
  const list = SEGMENTS[segment].fallbacks;
  return list[Math.floor(Math.random() * list.length)];
}

function cleanOutput(raw: string): string {
  let text = raw.trim();
  // Strip surrounding quotes the model may add despite instructions.
  text = text.replace(/^[«"'`]+/, "").replace(/[»"'`]+$/, "").trim();
  // Collapse to a single line.
  text = text.replace(/\s*\n+\s*/g, " ");
  if (text.length > OUTPUT_CHAR_CAP) {
    text = text.slice(0, OUTPUT_CHAR_CAP).replace(/\s+\S*$/, "") + "…";
  }
  return text;
}

async function callWithTimeout(prompt: string): Promise<string> {
  return await Promise.race([
    callOpenRouter({
      systemPrompt: prompt,
      userMessage: "Перепиши строчку по правилам выше.",
      maxTokens: MAX_OUTPUT_TOKENS,
    }),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("llm_timeout")), LLM_TIMEOUT_MS)
    ),
  ]);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const { line, segment } = (body ?? {}) as { line?: unknown; segment?: unknown };

  // ── Validation ──
  if (!isSegmentId(segment)) {
    return NextResponse.json({ error: "Неизвестный сегмент" }, { status: 400 });
  }
  if (typeof line !== "string") {
    return NextResponse.json({ error: "Поле line обязательно" }, { status: 400 });
  }
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_LINE) {
    return NextResponse.json(
      { error: `Введи строчку от 1 до ${MAX_LINE} символов` },
      { status: 400 }
    );
  }

  // ── Rate limit ──
  if (isRateLimited(getIp(req))) {
    return NextResponse.json(
      { error: "Слишком много запросов. Подожди минуту.", result: pickFallback(segment) },
      { status: 429 }
    );
  }

  // ── Junk / abuse / injection ──
  if (looksLikeJunk(trimmed)) {
    return NextResponse.json({ result: NEUTRAL }, { status: 200 });
  }

  // ── Cache ──
  const cacheKey = `${segment}::${trimmed.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ result: cached.result, cached: true });
  }

  // ── LLM ──
  try {
    const raw = await callWithTimeout(buildRewritePrompt(segment, trimmed));
    const result = cleanOutput(raw) || pickFallback(segment);
    cache.set(cacheKey, { result, at: Date.now() });
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[/api/rewrite] LLM failed, serving fallback:", err);
    // Never leave the demo block empty.
    return NextResponse.json({ result: pickFallback(segment), fallback: true });
  }
}
