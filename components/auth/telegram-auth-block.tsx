"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { reachGoal } from "@/lib/metrika";

type InitOk = { token: string; deep_link: string };
type StatusResp =
  | { status: "pending" }
  | { status: "ready"; token_hash: string }
  | { status: "consumed" }
  | { status: "expired" };

type Props = {
  promoCode?: string;
  consentPrivacy: boolean;
  consentMarketing?: boolean;
};

const POLL_MS = 1500;

export function TelegramAuthBlock(props: Props) {
  const { promoCode, consentPrivacy, consentMarketing } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState<{ token: string; deepLink: string } | null>(null);
  const [expired, setExpired] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  async function start() {
    if (!consentPrivacy) return;
    reachGoal("auth_telegram");
    setLoading(true);
    setError(null);
    setExpired(false);

    try {
      const res = await fetch("/api/auth/telegram/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent_privacy: true,
          consent_marketing: !!consentMarketing,
          promo_code: promoCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(humanError(data?.error));
        setLoading(false);
        return;
      }
      if (!data || typeof data.token !== "string" || typeof data.deep_link !== "string") {
        setError("Некорректный ответ сервера. Попробуйте ещё раз.");
        setLoading(false);
        return;
      }

      const ok = data as InitOk;
      window.open(ok.deep_link, "_blank", "noopener,noreferrer");
      setWaiting({ token: ok.token, deepLink: ok.deep_link });
      setLoading(false);
      startPolling(ok.token);
    } catch (e) {
      console.error(e);
      setError("Не удалось связаться с сервером. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  function startPolling(token: string) {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/telegram/status?token=${encodeURIComponent(token)}`);
        if (!res.ok) return;
        const data = (await res.json()) as Partial<StatusResp>;
        if (
          data?.status === "ready" &&
          typeof (data as { token_hash?: string }).token_hash === "string"
        ) {
          if (pollRef.current) window.clearInterval(pollRef.current);
          window.location.href =
            "/callback?token_hash=" +
            encodeURIComponent((data as { token_hash: string }).token_hash) +
            "&type=magiclink&next=/dashboard";
        } else if (data?.status === "expired" || data?.status === "consumed") {
          if (pollRef.current) window.clearInterval(pollRef.current);
          setExpired(true);
        }
      } catch (e) {
        console.warn("poll error", e);
      }
    }, POLL_MS);
  }

  function cancel() {
    if (pollRef.current) window.clearInterval(pollRef.current);
    setWaiting(null);
    setExpired(false);
  }

  if (waiting && !expired) {
    return (
      <div role="status" aria-live="polite" className="rounded-md border p-4 space-y-3 w-full">
        <p className="text-sm">
          Откройте Telegram и нажмите <strong>Start</strong> у бота
          <br />@cvbuilder_support_bot
        </p>
        <p className="text-sm text-muted-foreground">⏳ Ждём подтверждения от Telegram...</p>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(waiting.deepLink, "_blank", "noopener,noreferrer")}
          >
            Открыть Telegram ещё раз
          </Button>
          <Button type="button" variant="ghost" onClick={cancel}>
            Отменить
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Ссылка действительна 5 минут.</p>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="rounded-md border p-4 space-y-3 w-full">
        <p className="text-sm">Ссылка истекла или уже использована.</p>
        <Button
          type="button"
          onClick={() => {
            setExpired(false);
            setWaiting(null);
          }}
        >
          Начать заново
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        onClick={start}
        disabled={loading || !consentPrivacy}
        className="w-full"
      >
        {loading ? "..." : "Продолжить через Telegram"}
      </Button>
    </div>
  );
}

function humanError(code: string | undefined): string {
  switch (code) {
    case "consent_required":
      return "Подтвердите согласие с условиями использования.";
    case "bot_not_configured":
      return "Telegram-бот временно недоступен.";
    default:
      return "Ошибка. Попробуйте ещё раз.";
  }
}
