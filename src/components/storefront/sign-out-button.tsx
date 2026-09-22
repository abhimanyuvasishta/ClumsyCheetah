"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOut();
        router.push("/");
        router.refresh();
      }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
