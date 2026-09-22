"use client";

import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/storefront/price";
import { EmptyState } from "@/components/storefront/empty-state";
import { useCart } from "@/components/storefront/cart-provider";
import { useStorefrontConfig } from "@/components/storefront/storefront-config-provider";
import { amountToFreeDelivery } from "@/lib/commerce/cart";
import { formatInr } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { lines, subtotal, setQuantity, remove } = useCart();
  const { chrome, pages } = useStorefrontConfig();
  const remaining = amountToFreeDelivery(subtotal, chrome.freeDeliveryThresholdPaise);

  if (!lines.length) {
    return (
      <div className="store-wrap py-16">
        <h1 className="font-heading text-4xl">{pages.cart.heading}</h1>
        <EmptyState
          className="mt-8"
          title={pages.cart.emptyTitle}
          description={pages.cart.emptyBody}
          action={{ href: "/shop", label: pages.cart.emptyCta }}
        />
      </div>
    );
  }

  return (
    <div className="store-wrap grid gap-10 py-10 lg:grid-cols-[1fr_20rem]">
      <div>
        <h1 className="font-heading text-4xl">{pages.cart.heading}</h1>
        <ul className="mt-8 divide-y">
          {lines.map((line) => (
            <li key={line.variantId} className="flex gap-4 py-5">
              <Link href={`/products/${line.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {line.image ? <Image src={line.image} alt="" fill className="object-cover" /> : null}
              </Link>
              <div className="flex-1">
                <Link href={`/products/${line.slug}`} className="font-heading text-lg">
                  {line.name}
                </Link>
                <p className="text-sm text-muted-foreground">{line.variantName}</p>
                <Price paise={line.unitPricePaise} className="mt-1" />
                <div className="mt-3 flex items-center gap-4">
                  <div className="inline-flex rounded-full border">
                    <button type="button" className="px-3 py-1.5" onClick={() => setQuantity(line.variantId, line.quantity - 1)}>
                      −
                    </button>
                    <span className="min-w-6 py-1.5 text-center text-sm">{line.quantity}</span>
                    <button type="button" className="px-3 py-1.5" onClick={() => setQuantity(line.variantId, line.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button type="button" className="text-sm underline" onClick={() => remove(line.variantId)}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit rounded-[1.1rem] border bg-surface p-5">
        <h2 className="font-medium">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>
              <Price paise={subtotal} />
            </dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Delivery</dt>
            <dd>{remaining === 0 ? "Free" : "Calculated at checkout"}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Tax</dt>
            <dd>Included where applicable</dd>
          </div>
        </dl>
        {remaining > 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">You’re {formatInr(remaining)} away from free delivery.</p>
        ) : null}
        <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
          <input name="coupon" placeholder="Coupon" className="h-11 flex-1 rounded-full border px-4 text-sm" />
          <button type="submit" className="h-11 rounded-full border px-4 text-sm">
            Apply
          </button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">Coupons are checked on the server at checkout — not in this box.</p>
        <div className="mt-4 flex justify-between font-medium">
          <span>Total</span>
          <Price paise={subtotal} />
        </div>
        <Link href="/checkout" className={cn(buttonVariants(), "mt-5 flex h-12 w-full items-center justify-center rounded-full")}>
          Checkout
        </Link>
      </aside>
    </div>
  );
}
