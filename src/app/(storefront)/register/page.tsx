import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/storefront/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <BrandMark className="mb-8" />
      <p className="eyebrow">Join the bakery</p>
      <h1 className="mt-2 font-heading text-4xl">Save your usual order.</h1>
      <form className="mt-8 space-y-4">
        <input name="name" required placeholder="Name" className="h-12 w-full rounded-xl border px-4" />
        <input type="email" name="email" required placeholder="Email" className="h-12 w-full rounded-xl border px-4" />
        <input name="phone" placeholder="Phone" className="h-12 w-full rounded-xl border px-4" />
        <button type="submit" className={cn(buttonVariants(), "h-12 w-full rounded-full")}>
          Create account
        </button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/privacy" className="underline">
          privacy note
        </Link>
        . We will not invent a fake signup — this form waits on real Auth in Phase 3.
      </p>
      <p className="mt-4 text-sm">
        Already have a table?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
