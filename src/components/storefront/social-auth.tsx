"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth/actions";
import { authErrorMessage } from "@/lib/auth/errors";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SocialAuth({ next = "/account" }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function google() {
    setPending(true);
    setError(null);
    const result = await signInWithGoogle(next);
    if (result.error) {
      setPending(false);
      setError(authErrorMessage(result.error, "google"));
      return;
    }
    if (result.url) {
      window.location.assign(result.url);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={google}
        disabled={pending}
        className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full rounded-full")}
      >
        {pending ? "Opening Google…" : "Continue with Google"}
      </button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
