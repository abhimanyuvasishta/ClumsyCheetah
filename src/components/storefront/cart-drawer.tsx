"use client";

import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/storefront/price";
import { useCart } from "@/components/storefront/cart-provider";
import { useStorefrontConfig } from "@/components/storefront/storefront-config-provider";
import { amountToFreeDelivery } from "@/lib/commerce/cart";
import { formatInr } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/catalog";

export function CartDrawer({ upsells = [] }: { upsells?: CatalogProduct[] }) {
  const { lines, subtotal, drawerOpen, setDrawerOpen, setQuantity, remove } = useCart();
  const { chrome, pages } = useStorefrontConfig();
  const remaining = amountToFreeDelivery(subtotal, chrome.freeDeliveryThresholdPaise);

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="right" className="flex w-full flex-col bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="font-heading text-2xl">{pages.cart.heading}</SheetTitle>
        </SheetHeader>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-heading text-2xl">{pages.cart.emptyTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{pages.cart.emptyBody}</p>
            <Link href="/shop" onClick={() => setDrawerOpen(false)} className={cn(buttonVariants(), "mt-6 rounded-full")}>
              {pages.cart.emptyCta}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {remaining > 0 ? (
                <p className="mb-4 rounded-lg bg-secondary px-3 py-2 text-sm">
                  You’re {formatInr(remaining)} away from free delivery.
                </p>
              ) : (
                <p className="mb-4 rounded-lg bg-secondary px-3 py-2 text-sm">Delivery’s on us.</p>
              )}
              <ul className="space-y-4">
                {lines.map((line) => (
                  <li key={line.variantId} className="flex gap-3">
                    <Link href={`/products/${line.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {line.image ? <Image src={line.image} alt="" fill className="object-cover" /> : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${line.slug}`} className="font-heading leading-snug">
                        {line.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{line.variantName}</p>
                      <Price paise={line.unitPricePaise} className="mt-1 text-sm" />
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border">
                          <button type="button" className="px-3 py-1" aria-label="Decrease" onClick={() => setQuantity(line.variantId, line.quantity - 1)}>
                            −
                          </button>
                          <span className="min-w-6 text-center text-sm">{line.quantity}</span>
                          <button type="button" className="px-3 py-1" aria-label="Increase" onClick={() => setQuantity(line.variantId, line.quantity + 1)}>
                            +
                          </button>
                        </div>
                        <button type="button" className="text-xs underline" onClick={() => remove(line.variantId)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {upsells.length ? (
                <div className="mt-8">
                  <p className="text-sm font-medium">Make it a little sweeter</p>
                  <ul className="mt-3 space-y-2">
                    {upsells.slice(0, 2).map((p) => (
                      <li key={p.id}>
                        <Link href={`/products/${p.slug}`} className="text-sm underline-offset-2 hover:underline">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="space-y-3 border-t p-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <Price paise={subtotal} />
              </div>
              <Link href="/cart" onClick={() => setDrawerOpen(false)} className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full rounded-full")}>
                View cart
              </Link>
              <Link href="/checkout" onClick={() => setDrawerOpen(false)} className={cn(buttonVariants(), "h-11 w-full rounded-full")}>
                Checkout
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
