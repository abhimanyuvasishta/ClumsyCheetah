"use client";

import { useState } from "react";
import Link from "next/link";
import { Price } from "@/components/storefront/price";
import { useCart } from "@/components/storefront/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = ["Contact", "Delivery", "Payment"] as const;

export default function CheckoutPage() {
  const { lines, subtotal } = useCart();
  const [step, setStep] = useState(0);

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-heading text-3xl">Nothing to check out yet.</h1>
        <Link href="/shop" className={cn(buttonVariants(), "mt-6 inline-flex rounded-full")}>
          Shop the good stuff
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 lg:grid-cols-[1fr_18rem]">
      <div>
        <ol className="mb-8 flex gap-4 text-sm">
          {steps.map((label, i) => (
            <li key={label} className={i === step ? "font-medium" : "text-muted-foreground"}>
              {i + 1}. {label}
            </li>
          ))}
        </ol>
        {step === 0 ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(1);
            }}
          >
            <h1 className="font-heading text-3xl">Who’s receiving this?</h1>
            <input required name="name" placeholder="Name" className="h-12 w-full rounded-xl border px-4" />
            <input required type="email" name="email" placeholder="Email" className="h-12 w-full rounded-xl border px-4" />
            <input required name="phone" placeholder="Phone" className="h-12 w-full rounded-xl border px-4" />
            <button type="submit" className={cn(buttonVariants(), "h-12 w-full rounded-full")}>
              Continue to delivery
            </button>
          </form>
        ) : null}
        {step === 1 ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
          >
            <h1 className="font-heading text-3xl">Where should it go?</h1>
            <input required placeholder="Address line 1" className="h-12 w-full rounded-xl border px-4" />
            <input placeholder="Landmark" className="h-12 w-full rounded-xl border px-4" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="City" className="h-12 rounded-xl border px-4" />
              <input required placeholder="Pincode" className="h-12 rounded-xl border px-4" />
            </div>
            <textarea placeholder="Delivery notes" className="min-h-24 w-full rounded-xl border px-4 py-3" />
            <button type="submit" className={cn(buttonVariants(), "h-12 w-full rounded-full")}>
              Continue to payment
            </button>
          </form>
        ) : null}
        {step === 2 ? (
          <div>
            <h1 className="font-heading text-3xl">Payment</h1>
            <p className="mt-3 text-muted-foreground">
              Razorpay and cash on delivery are wired in a later phase. This step is the layout only — we will not take a card number here.
            </p>
            <div className="mt-6 space-y-3">
              <label className="flex min-h-12 items-center gap-3 rounded-xl border px-4">
                <input type="radio" name="pay" defaultChecked />
                Pay online (Razorpay)
              </label>
              <label className="flex min-h-12 items-center gap-3 rounded-xl border px-4">
                <input type="radio" name="pay" />
                Cash on delivery
              </label>
            </div>
            <button type="button" className={cn(buttonVariants(), "mt-6 h-12 w-full rounded-full")} disabled>
              Place order — coming next
            </button>
          </div>
        ) : null}
      </div>
      <aside className="h-fit rounded-[1.1rem] border p-4">
        <p className="font-medium">Your bakes</p>
        <ul className="mt-3 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-2">
              <span>
                {l.name} × {l.quantity}
              </span>
              <Price paise={l.unitPricePaise * l.quantity} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t pt-3 font-medium">
          <span>Total</span>
          <Price paise={subtotal} />
        </div>
      </aside>
    </div>
  );
}
