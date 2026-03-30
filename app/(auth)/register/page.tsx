"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { reachGoal } from "@/lib/metrika";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function RegisterForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [promoCode, setPromoCode] = useState(searchParams.get("ref") || "");
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
        data: {
          full_name: fullName,
          promo_code: promoCode || undefined,
          consent_privacy: consentPrivacy,
          consent_marketing: consentMarketing,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
      reachGoal('registration');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="text-lg font-bold mb-2 inline-block" style={{ color: "#a78bfa" }}>
            CV Builder
          </Link>
          <CardTitle>Регистрация в CV Builder</CardTitle>
          <CardDescription>
            Создайте аккаунт — первая адаптация резюме бесплатно
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {sent ? (
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm">
                  Ссылка для входа отправлена на <strong>{email}</strong>.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Проверьте почту и перейдите по ссылке.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Имя</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Иван Иванов"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promoCode">Промо-код (необязательно)</Label>
                  <Input
                    id="promoCode"
                    type="text"
                    placeholder="Например: REF-A7K2M9"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="consentPrivacy"
                      checked={consentPrivacy}
                      onCheckedChange={(checked) =>
                        setConsentPrivacy(checked === true)
                      }
                    />
                    <label
                      htmlFor="consentPrivacy"
                      className="text-sm leading-tight cursor-pointer"
                    >
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
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="consentMarketing"
                      checked={consentMarketing}
                      onCheckedChange={(checked) =>
                        setConsentMarketing(checked === true)
                      }
                    />
                    <label
                      htmlFor="consentMarketing"
                      className="text-sm leading-tight cursor-pointer"
                    >
                      Я согласен получать маркетинговые рассылки
                    </label>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {!sent && (
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !consentPrivacy}
              >
                {loading ? "Отправка..." : "Зарегистрироваться"}
              </Button>
            )}
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="underline">
                Войти
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
