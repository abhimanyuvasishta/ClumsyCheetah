"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestPhoneOtp, signInWithGoogle, verifyPhoneOtp } from "@/lib/auth/actions";
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

  async function google() {
    setPending("google");
    setError(null);
    const result = await signInWithGoogle(next);
    if (result.error) {
      setPending(null);
      setError(result.error);
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setPending("phone");
    setError(null);
    const result = await requestPhoneOtp(phone);
    setPending(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    setCodeSent(true);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setPending("verify");
    setError(null);
    const result = await verifyPhoneOtp(phone, code);
    setPending(null);
    if (result.error) {
      setError(result.error);
      return;
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
          Continue with phone
        </button>
      ) : (
        <form onSubmit={codeSent ? verify : sendCode} className="space-y-2 rounded-2xl border p-3">
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="h-11 w-full rounded-full border px-4 text-sm"
          />
          {codeSent ? (
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit SMS code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="h-11 w-full rounded-full border px-4 text-sm"
            />
          ) : null}
          <button type="submit" disabled={pending !== null} className={cn(buttonVariants(), "h-11 w-full rounded-full")}>
            {pending === "phone" || pending === "verify"
              ? "Please wait…"
              : codeSent
                ? "Verify code"
                : "Send SMS code"}
          </button>
        </form>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
