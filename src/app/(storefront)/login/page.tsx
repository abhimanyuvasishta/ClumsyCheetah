import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/storefront/brand-mark";
import { LoginForm } from "./login-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAuthUser } from "@/lib/auth/staff";

export const metadata: Metadata = { title: "Login" };
export const dynamic = "force-dynamic";

function safeNext(value: string | undefined) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/account";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: nextRaw } = await searchParams;
  const next = safeNext(nextRaw);
  const user = await getAuthUser();
  if (user) {
    redirect(next);
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-3 font-heading text-4xl md:text-5xl">The usual table?</h1>
        <p className="mt-3 text-muted-foreground">We’ll remember your bag, your pins, and the cake you always mean to reorder.</p>
      </div>
      <div className="rounded-[1.2rem] border bg-surface p-6 md:p-8">
        <BrandMark className="mb-6" />
        <div className="space-y-2">
          <button type="button" disabled className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full rounded-full")}>
            Continue with Google
          </button>
          <button type="button" disabled className={cn(buttonVariants({ variant: "outline" }), "h-12 w-full rounded-full")}>
            Continue with phone
          </button>
        </div>
        <p className="my-4 text-center text-xs text-muted-foreground">or email</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="underline">
            Create an account
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">Google and phone OTP land when Auth providers are enabled. Email works today.</p>
      </div>
    </div>
  );
}
