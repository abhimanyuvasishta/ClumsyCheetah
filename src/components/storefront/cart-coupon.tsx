"use client";

import { useEffect, useState } from "react";
import { previewCoupon, type CouponPreview } from "@/app/admin/offers/actions";
import { formatInr } from "@/lib/money";
import { readStoredCoupon, writeStoredCoupon } from "@/components/storefront/shop-commerce";
import type { CartLine } from "@/lib/commerce/cart";

export function CartCoupon({ lines }: { lines: CartLine[] }) {
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<CouponPreview | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const stored = readStoredCoupon();
    if (stored) setCode(stored);
  }, []);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await previewCoupon(
      code,
      lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitPaise: l.unitPricePaise })),
    );
    setPending(false);
    setPreview(result);
    if (!result.error && result.code) writeStoredCoupon(result.code);
  }

  function clear() {
    writeStoredCoupon("");
    setCode("");
    setPreview(null);
  }

  return (
    <div className="mt-4">
      <form className="flex gap-2" onSubmit={apply}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="h-11 flex-1 rounded-full border px-4 text-sm"
        />
        <button type="submit" disabled={pending} className="h-11 rounded-full border px-4 text-sm">
          {pending ? "Checking…" : "Apply"}
        </button>
      </form>
      {preview?.error ? <p className="mt-2 text-xs text-destructive">{preview.error}</p> : null}
      {preview && !preview.error ? (
        <p className="mt-2 text-xs">
          {preview.name}: {preview.message}
          {preview.discountPaise ? ` · ${formatInr(preview.discountPaise)} off` : ""}
          {preview.giftName ? ` · free ${preview.giftName}` : ""}
          <button type="button" className="ml-2 underline" onClick={clear}>
            Remove
          </button>
        </p>
      ) : null}
    </div>
  );
}
