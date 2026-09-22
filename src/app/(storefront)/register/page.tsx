import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/storefront/brand-mark";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <BrandMark className="mb-8" />
      <p className="eyebrow">Join the bakery</p>
      <h1 className="mt-2 font-heading text-4xl">Save your usual order.</h1>
      <RegisterForm />
      <p className="mt-4 text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/privacy" className="underline">
          privacy note
        </Link>
        .
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
