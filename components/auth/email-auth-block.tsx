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
          placeholder="Код из письма"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
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
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            disabled={busy}
            onClick={() => {
              if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
              }
              setCooldown(0);
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
