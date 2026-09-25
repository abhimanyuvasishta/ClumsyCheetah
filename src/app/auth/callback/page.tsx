"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { AUTH_NEXT_COOKIE, authErrorMessage } from "@/lib/auth/errors";

function readNext(): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_NEXT_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : "/account";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/account";
}

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const oauthError = params.get("error_description") ?? params.get("error");
    if (oauthError) {
      router.replace(`/login?error=${encodeURIComponent(authErrorMessage(oauthError))}`);
      return;
    }
    const code = params.get("code");
    const supabase = createBrowserSupabaseClient();
    if (!code || !supabase) {
      router.replace(`/login?error=${encodeURIComponent(authErrorMessage(null))}`);
      return;
    }
    void supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setMessage(authErrorMessage(error.message));
        router.replace(`/login?error=${encodeURIComponent(authErrorMessage(error.message))}`);
        return;
      }
      router.replace(readNext());
      router.refresh();
    });
  }, [params, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-muted-foreground">Signing you in…</p>}>
      <CallbackInner />
    </Suspense>
  );
}
