"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // Implicit flow puts tokens in the URL hash fragment.
    // The Supabase client detects them automatically via onAuthStateChange.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.replace("/dashboard");
      }
    });

    // If no auth event fires within 5s, something went wrong
    const timeout = setTimeout(() => {
      router.replace("/login?error=auth");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Авторизация...</p>
    </div>
  );
}
