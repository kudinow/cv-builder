# Email OTP Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email login via 6-digit OTP code on `/auth`, co-equal with Telegram, with no new API routes and no DB migration.

**Architecture:** A client component (`EmailAuthBlock`) uses the browser Supabase client (`@supabase/ssr`) directly: `signInWithOtp({ email, options: { data } })` to send a code, `verifyOtp({ email, token, type: 'email' })` to log in. The existing `handle_new_user` trigger already creates email profiles (telegram_id NULL, auth_provider 'email', 50 tokens + promo). Pure logic (email validation, error mapping) lives in a node-testable helper module.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (`@supabase/ssr`), vitest (node env), Tailwind + shadcn ui components.

**Spec:** `docs/superpowers/specs/2026-06-05-email-auth-design.md`

---

## File Structure

- **Create** `lib/auth/email-otp.ts` — pure helpers: `isValidEmail`, `mapOtpError`, `RESEND_COOLDOWN_SECONDS`. Single responsibility: email-OTP logic with no React/Supabase deps, fully unit-testable.
- **Create** `lib/auth/__tests__/email-otp.test.ts` — vitest tests for the helpers.
- **Create** `components/auth/email-auth-block.tsx` — client component: email→code two-step UI + Supabase calls. Mirrors `components/auth/telegram-auth-block.tsx` conventions.
- **Modify** `app/(auth)/auth/page.tsx` — add an "или" divider and `<EmailAuthBlock>` below `<TelegramAuthBlock>`, passing the same shared props.

No changes to: server routes, `/callback`, middleware, SQL migrations.

---

### Task 1: Email-OTP helper module (TDD)

**Files:**
- Create: `lib/auth/email-otp.ts`
- Test: `lib/auth/__tests__/email-otp.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/auth/__tests__/email-otp.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isValidEmail, mapOtpError, RESEND_COOLDOWN_SECONDS } from "../email-otp";

describe("isValidEmail", () => {
  it("accepts a normal email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });
  it("rejects missing @ or domain", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user@example")).toBe(false);
  });
  it("rejects empty / whitespace", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("  ")).toBe(false);
  });
  it("trims surrounding whitespace before validating", () => {
    expect(isValidEmail("  user@example.com  ")).toBe(true);
  });
});

describe("mapOtpError", () => {
  it("returns empty string for no error", () => {
    expect(mapOtpError(null)).toBe("");
  });
  it("maps rate-limit (status 429)", () => {
    expect(mapOtpError({ status: 429 })).toBe("Слишком часто, попробуйте через минуту.");
  });
  it("maps rate-limit (code over_email_send_rate_limit)", () => {
    expect(mapOtpError({ code: "over_email_send_rate_limit" })).toBe(
      "Слишком часто, попробуйте через минуту."
    );
  });
  it("maps expired/invalid code", () => {
    expect(mapOtpError({ code: "otp_expired" })).toBe(
      "Неверный или устаревший код, запросите новый."
    );
    expect(mapOtpError({ message: "Token has expired or is invalid" })).toBe(
      "Неверный или устаревший код, запросите новый."
    );
  });
  it("falls back to a generic message", () => {
    expect(mapOtpError({ message: "boom" })).toBe("Что-то пошло не так. Попробуйте ещё раз.");
  });
});

describe("RESEND_COOLDOWN_SECONDS", () => {
  it("is 60", () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/auth/__tests__/email-otp.test.ts`
Expected: FAIL — cannot resolve module `../email-otp`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/auth/email-otp.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/auth/__tests__/email-otp.test.ts`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/email-otp.ts lib/auth/__tests__/email-otp.test.ts
git commit -m "feat(auth): email-otp helper (validation + error mapping)"
```

---

### Task 2: EmailAuthBlock component

**Files:**
- Create: `components/auth/email-auth-block.tsx`

No unit test: vitest runs in `node` environment (no jsdom/RTL), so this component is verified by typecheck/lint/build and the manual checklist in Task 4. All testable logic already lives in `lib/auth/email-otp.ts` (Task 1).

- [ ] **Step 1: Write the component**

Create `components/auth/email-auth-block.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { reachGoal } from "@/lib/metrika";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidEmail, mapOtpError, RESEND_COOLDOWN_SECONDS } from "@/lib/auth/email-otp";

type Props = {
  promoCode?: string;
  consentPrivacy: boolean;
  consentMarketing?: boolean;
};

export function EmailAuthBlock(props: Props) {
  const { promoCode, consentPrivacy, consentMarketing } = props;

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCooldown((c) => {
        if (c <= 1 && timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function sendCode() {
    if (!consentPrivacy || !isValidEmail(email)) return;
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: {
          consent_privacy: true,
          consent_marketing: !!consentMarketing,
          promo_code: promoCode || undefined,
          full_name: "",
        },
      },
    });
    setBusy(false);
    if (err) {
      setError(mapOtpError(err));
      return;
    }
    setStep("code");
    startCooldown();
  }

  async function verify() {
    if (code.trim().length < 6) return;
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (err) {
      setError(mapOtpError(err));
      return;
    }
    reachGoal("auth_email");
    window.location.href = "/dashboard";
  }

  if (step === "code") {
    return (
      <div className="space-y-3 w-full">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-sm text-muted-foreground">
          Мы отправили код на <strong>{email.trim()}</strong>. Введите его ниже.
        </p>
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-значный код"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <Button type="button" onClick={verify} disabled={busy || code.trim().length < 6} className="w-full">
          {busy ? "..." : "Войти"}
        </Button>
        <div className="flex justify-between text-sm">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            onClick={sendCode}
            disabled={busy || cooldown > 0}
          >
            {cooldown > 0 ? `Отправить заново (${cooldown})` : "Отправить заново"}
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
          >
            Изменить email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Input
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        type="button"
        onClick={sendCode}
        disabled={busy || !consentPrivacy || !isValidEmail(email)}
        className="w-full"
      >
        {busy ? "..." : "Получить код на email"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npx eslint components/auth/email-auth-block.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/auth/email-auth-block.tsx
git commit -m "feat(auth): EmailAuthBlock — email OTP login component"
```

---

### Task 3: Wire EmailAuthBlock into /auth

**Files:**
- Modify: `app/(auth)/auth/page.tsx`

- [ ] **Step 1: Add the import**

In `app/(auth)/auth/page.tsx`, add below the existing `TelegramAuthBlock` import (currently line 16):

```tsx
import { EmailAuthBlock } from "@/components/auth/email-auth-block";
```

- [ ] **Step 2: Render divider + EmailAuthBlock in the footer**

Replace the existing `<CardFooter>` block (currently lines 87-93):

```tsx
        <CardFooter>
          <TelegramAuthBlock
            promoCode={promoCode}
            consentPrivacy={consentPrivacy}
            consentMarketing={consentMarketing}
          />
        </CardFooter>
```

with:

```tsx
        <CardFooter className="flex-col gap-4">
          <TelegramAuthBlock
            promoCode={promoCode}
            consentPrivacy={consentPrivacy}
            consentMarketing={consentMarketing}
          />
          <div className="flex items-center gap-3 w-full text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            или
            <span className="h-px flex-1 bg-border" />
          </div>
          <EmailAuthBlock
            promoCode={promoCode}
            consentPrivacy={consentPrivacy}
            consentMarketing={consentMarketing}
          />
        </CardFooter>
```

Also update the card description (currently line 34-36) from `Один клик через Telegram` to reflect both options:

```tsx
          <CardDescription>
            Через Telegram или по коду на email
          </CardDescription>
```

- [ ] **Step 3: Typecheck + lint + build**

Run: `npx tsc --noEmit && npx eslint "app/(auth)/auth/page.tsx" && npm run build`
Expected: build succeeds, no type/lint errors.

- [ ] **Step 4: Run full test suite (no regressions)**

Run: `npx vitest run`
Expected: all tests pass (existing + new email-otp tests).

- [ ] **Step 5: Commit**

```bash
git add "app/(auth)/auth/page.tsx"
git commit -m "feat(auth): show EmailAuthBlock alongside Telegram on /auth"
```

---

### Task 4: Supabase email config + deploy + manual QA

**Files:** none (operational).

- [ ] **Step 1: Verify Supabase email template carries the code**

In Supabase Dashboard → Authentication → Email Templates → **Magic Link**: ensure the body includes the OTP token, e.g. a line rendering `{{ .Token }}`. Without it the email will not show a code. (Adjust the branded template accordingly.)

- [ ] **Step 2: Check SMTP configuration**

In Supabase Dashboard → Authentication → SMTP Settings: confirm a custom SMTP provider is configured. If only Supabase's built-in email is active (≈2-4 emails/hour limit), note it as a follow-up — connect a transactional provider (Resend/Postmark/Yandex) with SPF/DKIM for `cv-builder.ru` before relying on email at volume. Record the finding either way.

- [ ] **Step 3: Deploy**

```bash
git push origin main
ssh kudinow@158.160.160.206 "bash ~/deploy.sh"
```

- [ ] **Step 4: Manual QA on cv-builder.ru/auth**

Verify each (record pass/fail):
1. New email → consent checked → "Получить код" → code arrives → enter code → lands on `/dashboard`; profile has 50 tokens (+ promo bonus if a code was entered).
2. Returning email (same address) → logs in, no double token grant.
3. Wrong code → "Неверный или устаревший код, запросите новый."
4. "Отправить заново" disabled with countdown, then re-enabled.
5. Cross-browser: request code in browser A, enter it in browser B → still logs in.
6. Telegram login still works unchanged.

- [ ] **Step 5: Update CLAUDE.md + memory**

Update `resume-ai/CLAUDE.md` auth notes and the `project_telegram_auth` memory to record that email OTP is now a co-equal login method (separate accounts, no linking), and commit the CLAUDE.md change.

---

## Self-Review

**Spec coverage:**
- Co-equal email on `/auth` → Task 3. ✓
- OTP code mechanic → Task 2 (`signInWithOtp`/`verifyOtp type: 'email'`). ✓
- Same Supabase email pipeline; template `{{ .Token }}` + SMTP check → Task 4 steps 1-2. ✓
- Separate accounts, no migration (trigger handles email users) → noted in architecture; no migration task by design. ✓
- Shared consent/promo/marketing props → Task 3 passes same props. ✓
- Metric `auth_email` → Task 2 `verify()`. ✓
- Error handling (invalid/expired, rate-limit, consent gating, network) → Task 1 `mapOtpError` + Task 2 disabled states. ✓
- Tests (validator + logic) → Task 1; component build-verified → Tasks 2-3. ✓
- Manual checklist incl. cross-browser → Task 4 step 4. ✓

**Placeholder scan:** No TBD/TODO; all code shown in full. ✓

**Type consistency:** `Props` shape (`promoCode?`, `consentPrivacy`, `consentMarketing?`) matches `TelegramAuthBlock` and the `/auth` props passed in Task 3. Helper names (`isValidEmail`, `mapOtpError`, `RESEND_COOLDOWN_SECONDS`) consistent across Tasks 1-2. `verifyOtp` uses `type: "email"` throughout. ✓
