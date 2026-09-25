import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/storefront/brand-mark";
import { SocialAuth } from "@/components/storefront/social-auth";
import { LoginForm } from "./login-form";
import { getAuthUser } from "@/lib/auth/staff";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata: Metadata = { title: "Login" };
export const dynamic = "force-dynamic";

function safeNext(value: string | undefined) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/account";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next: nextRaw, error } = await searchParams;
  const next = safeNext(nextRaw);
  const user = await getAuthUser();
  if (user) {
    redirect(next);
  }
  const { pages } = await getStorefrontConfig();

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <p className="eyebrow">{pages.login.eyebrow ?? "Welcome back"}</p>
        <h1 className="mt-3 font-heading text-4xl md:text-5xl">{pages.login.heading}</h1>
        <p className="mt-3 text-muted-foreground">{pages.login.body}</p>
      </div>
      <div className="rounded-[1.2rem] border bg-surface p-6 md:p-8">
        <BrandMark className="mb-6" />
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        <SocialAuth next={next} />
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
      </div>
    </div>
  );
}
