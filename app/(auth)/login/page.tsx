"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { reachGoal } from "@/lib/metrika";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
      reachGoal('login');
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
          <CardTitle>Вход в CV Builder</CardTitle>
          <CardDescription>
            Введите email — мы отправим вам ссылку для входа
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {authError && (
              <p className="text-sm text-destructive">
                Ошибка авторизации. Попробуйте ещё раз.
              </p>
            )}
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
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {!sent && (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Отправка..." : "Войти по email"}
              </Button>
            )}
            <p className="text-sm text-muted-foreground">
              Нет аккаунта?{" "}
              <Link href="/register" className="underline">
                Зарегистрироваться
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
