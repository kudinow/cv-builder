"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthSkeleton } from "@/components/auth/auth-skeleton";
import { TelegramAuthBlock } from "@/components/auth/telegram-auth-block";

function AuthForm() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref") || "";
  const errorParam = searchParams.get("error");
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [promoCode, setPromoCode] = useState(refParam);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="text-lg font-bold mb-2 inline-block" style={{ color: "#a78bfa" }}>
            CV Builder
          </Link>
          <CardTitle>Войти или зарегистрироваться</CardTitle>
          <CardDescription>
            Один клик через Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorParam && (
            <p className="text-sm text-destructive">
              Ошибка авторизации. Попробуйте ещё раз.
            </p>
          )}
          <div className="flex items-start gap-2">
            <Checkbox
              id="consentPrivacy"
              checked={consentPrivacy}
              onCheckedChange={(c) => setConsentPrivacy(c === true)}
            />
            <label htmlFor="consentPrivacy" className="text-sm leading-tight cursor-pointer">
              Я принимаю{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-violet-400 hover:text-violet-300"
              >
                условия использования и политику конфиденциальности
              </a>
            </label>
          </div>

          <details className="text-sm" open={!!refParam}>
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Есть промо-код?
            </summary>
            <input
              type="text"
              placeholder="Например: REF-A7K2M9"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </details>

          <div className="flex items-start gap-2">
            <Checkbox
              id="consentMarketing"
              checked={consentMarketing}
              onCheckedChange={(c) => setConsentMarketing(c === true)}
            />
            <label htmlFor="consentMarketing" className="text-sm leading-tight cursor-pointer">
              Хочу получать полезные письма и спецпредложения
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <TelegramAuthBlock
            promoCode={promoCode}
            consentPrivacy={consentPrivacy}
            consentMarketing={consentMarketing}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthForm />
    </Suspense>
  );
}
