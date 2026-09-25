import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/storefront/brand-mark";
import { RegisterForm } from "./register-form";
import { SocialAuth } from "@/components/storefront/social-auth";
import { getStorefrontConfig } from "@/lib/storefront/queries";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: nextRaw } = await searchParams;
  const next = nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/account";
  const { pages } = await getStorefrontConfig();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <BrandMark className="mb-8" />
      <p className="eyebrow">{pages.register.eyebrow ?? "Join the bakery"}</p>
      <h1 className="mt-2 font-heading text-4xl">{pages.register.heading}</h1>
      <div className="mt-8">
        <SocialAuth next={next} />
        <p className="my-4 text-center text-xs text-muted-foreground">or email</p>
      </div>
      <RegisterForm next={next} />
      <p className="mt-4 text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/privacy" className="underline">
          privacy note
        </Link>
        .
      </p>
      <p className="mt-4 text-sm">
        Already have a table?{" "}
        <Link href={next === "/account" ? "/login" : `/login?next=${encodeURIComponent(next)}`} className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
