"use client";

import { useActionState, useState } from "react";
import { submitProductReview, type ReviewState } from "@/app/(storefront)/account/orders/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const empty: ReviewState = {};

export function OrderProductFeedback({
  orderId,
  productId,
  productName,
  existing,
}: {
  orderId: string;
  productId: string;
  productName: string;
  existing?: { rating: number; body: string | null } | null;
}) {
  const [state, action, pending] = useActionState(submitProductReview, empty);
  const [rating, setRating] = useState(5);

  if (existing) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Your feedback: {existing.rating}/5
        {existing.body ? ` — ${existing.body}` : ""}
      </p>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-2 rounded-xl border bg-background/60 p-3">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <p className="text-xs font-medium">How was {productName}?</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={cn("size-8 rounded-full border text-sm", n <= rating ? "border-gold bg-gold/30" : "")}
            aria-label={`${n} stars`}
          >
            {n}
          </button>
        ))}
      </div>
      <input name="title" placeholder="Headline (optional)" className="h-9 w-full rounded-lg border px-3 text-sm" />
      <textarea name="body" required minLength={8} placeholder="Tell us how it tasted" className="min-h-20 w-full rounded-lg border px-3 py-2 text-sm" />
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      {state.ok ? <p className="text-xs">Thank you — we published that on the product page.</p> : null}
      <button type="submit" disabled={pending} className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
        {pending ? "Saving…" : "Share feedback"}
      </button>
    </form>
  );
}
