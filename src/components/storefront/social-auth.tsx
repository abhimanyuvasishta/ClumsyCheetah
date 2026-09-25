"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestPhoneOtp, verifyPhoneOtp } from "@/app/(storefront)/login/phone-actions";
import { signInWithGoogle } from "@/lib/auth/actions";
import { authErrorMessage } from "@/lib/auth/errors";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SocialAuth({ next = "/account" }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"google" | "phone" | "verify" | null>(null);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [factorSession, setFactorSession] = useState("");
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  async function google() {
    setPending("google");
    setError(null);
    const result = await signInWithGoogle(next);
    if (result.error) {
      setPending(null);
      setError(authErrorMessage(result.error, "google"));
      return;
    }
    if (result.url) {
      window.location.assign(result.url);
    }
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setPending("phone");
    setError(null);
    const result = await requestPhoneOtp(phone);
    setPending(null);
    if (result.error) {
      setError(authErrorMessage(result.error, "phone"));
      return;
    }
    setFactorSession(result.sessionId ?? "");
    setCodeSent(true);
    setResendIn(45);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setPending("verify");
    setError(null);
    const result = await verifyPhoneOtp(phone, factorSession, code);
    setPending(null);
    if (result.error) {
      setError(authErrorMessage(result.error, "phone"));
      return;
    }
    if (result.accessToken && result.refreshToken) {
      const supabase = createBrowserSupabaseClient();
      if (supabase) {
        await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        });
      }
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={google}
        disabled={pending !== null}
        className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full rounded-full")}
      >
        {pending === "google" ? "Opening Google…" : "Continue with Google"}
      </button>
      {!phoneOpen ? (
        <button
          type="button"
          onClick={() => setPhoneOpen(true)}
          disabled={pending !== null}
          className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full rounded-full")}
        >
          Continue with phone OTP
        </button>
      ) : (
        <form onSubmit={codeSent ? verify : sendCode} className="space-y-2 rounded-2xl border p-3">
          <p className="text-xs text-muted-foreground">We’ll text a 6-digit code. India numbers only.</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="h-11 flex-1 rounded-full border px-4 text-sm"
            />
          </div>
          {codeSent ? (
            <>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit SMS code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="h-11 w-full rounded-full border px-4 text-sm"
              />
              <p className="text-xs text-muted-foreground">Code sent to +91 {phone.replace(/\D/g, "").slice(-10)}</p>
            </>
          ) : null}
          <button type="submit" disabled={pending !== null} className={cn(buttonVariants(), "h-11 w-full rounded-full")}>
            {pending === "phone" || pending === "verify"
              ? "Please wait…"
              : codeSent
                ? "Verify and sign in"
                : "Send SMS code"}
          </button>
          {codeSent ? (
            <button
              type="button"
              disabled={pending !== null || resendIn > 0}
              onClick={() => void sendCode()}
              className="w-full text-xs underline"
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          ) : null}
        </form>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
