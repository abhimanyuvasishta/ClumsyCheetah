"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createOffer, type ActionState } from "@/app/admin/offers/actions";
import { productMatchesOffer } from "@/lib/offers/types";
import type { OfferPickerProduct } from "@/lib/offers/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptyState: ActionState = {};

function toIsoLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function OfferForm({
  products,
  categories,
}: {
  products: OfferPickerProduct[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createOffer, emptyState);
  const [kind, setKind] = useState("PERCENTAGE");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [eggless, setEggless] = useState(false);
  const [veg, setVeg] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [fresh, setFresh] = useState(false);

  const startDefault = toIsoLocal(new Date());
  const endDefault = toIsoLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const matching = useMemo(
    () =>
      products.filter((p) =>
        productMatchesOffer(
          {
            id: p.id,
            categoryId: p.primary_category_id,
            isEggless: p.is_eggless,
            isVegetarian: p.is_vegetarian,
            isBestseller: p.is_bestseller,
            isNewArrival: p.is_new_arrival,
          },
          {
            applicable_product_ids: [],
            applicable_category_ids: categoryIds,
            filter_eggless: eggless,
            filter_vegetarian: veg,
            filter_bestseller: bestseller,
            filter_new_arrival: fresh,
          },
        ),
      ),
    [products, categoryIds, eggless, veg, bestseller, fresh],
  );

  const visible = matching.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    if (state.ok) router.push("/admin/offers");
  }, [state.ok, router]);

  return (
    <form action={action} className="mt-6 space-y-6">
      {selected.map((id) => (
        <input key={id} type="hidden" name="product_ids" value={id} />
      ))}
      {categoryIds.map((id) => (
        <input key={id} type="hidden" name="category_ids" value={id} />
      ))}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Name
          <input required name="name" className="mt-1 h-10 w-full rounded-lg border px-3" placeholder="Weekend 10% off" />
        </label>
        <label className="text-sm">
          Coupon code (optional)
          <input name="coupon_code" className="mt-1 h-10 w-full rounded-lg border px-3 uppercase" placeholder="SWEET10" />
        </label>
      </div>
      <label className="block text-sm">
        Description
        <textarea name="description" className="mt-1 min-h-20 w-full rounded-lg border px-3 py-2" />
      </label>
      <label className="block text-sm">
        Shop banner text
        <input name="banner_text" className="mt-1 h-10 w-full rounded-lg border px-3" placeholder="10% off cakes this weekend" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="show_banner" defaultChecked /> Show on shop banner
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked /> Active when the window starts
      </label>

      <fieldset className="rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Offer type</legend>
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)} className="mt-2 h-10 rounded-lg border px-3 text-sm">
          <option value="PERCENTAGE">Percent off</option>
          <option value="FIXED">Fixed rupees off</option>
          <option value="FREE_DELIVERY">Free delivery</option>
          <option value="FREE_GIFT">Free gift</option>
        </select>
        {kind === "PERCENTAGE" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Percent
              <input name="percent_off" type="number" min={1} max={90} defaultValue={10} className="mt-1 h-10 w-full rounded-lg border px-3" />
            </label>
            <label className="text-sm">
              Max discount (₹, optional)
              <input name="max_discount_rupees" className="mt-1 h-10 w-full rounded-lg border px-3" />
            </label>
          </div>
        ) : null}
        {kind === "FIXED" ? (
          <label className="mt-3 block text-sm">
            Amount off (₹)
            <input name="amount_off_rupees" className="mt-1 h-10 w-full rounded-lg border px-3" />
          </label>
        ) : null}
        {kind === "FREE_GIFT" ? (
          <label className="mt-3 block text-sm">
            Gift product
            <select name="gift_product_id" className="mt-1 h-10 w-full rounded-lg border px-3">
              <option value="">Select</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="mt-3 block text-sm">
          Minimum order (₹)
          <input name="min_order_rupees" defaultValue="0" className="mt-1 h-10 w-full rounded-lg border px-3" />
        </label>
        <label className="mt-3 block text-sm">
          Usage limit (optional)
          <input name="usage_limit" type="number" min={1} className="mt-1 h-10 w-full rounded-lg border px-3" />
        </label>
      </fieldset>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Starts
          <input required type="datetime-local" name="starts_at" defaultValue={startDefault} className="mt-1 h-10 w-full rounded-lg border px-3" />
        </label>
        <label className="text-sm">
          Ends
          <input required type="datetime-local" name="ends_at" defaultValue={endDefault} className="mt-1 h-10 w-full rounded-lg border px-3" />
        </label>
      </div>

      <fieldset className="rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Who it applies to</legend>
        <p className="text-xs text-muted-foreground">Leave products empty for the whole shop, then narrow with filters.</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {categories.map((c) => (
            <label key={c.id} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={categoryIds.includes(c.id)}
                onChange={() =>
                  setCategoryIds((prev) => (prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]))
                }
              />
              {c.name}
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="filter_eggless" checked={eggless} onChange={(e) => setEggless(e.target.checked)} />
            Eggless
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="filter_vegetarian" checked={veg} onChange={(e) => setVeg(e.target.checked)} />
            Vegetarian
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="filter_bestseller" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} />
            Bestseller
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" name="filter_new_arrival" checked={fresh} onChange={(e) => setFresh(e.target.checked)} />
            New arrival
          </label>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="mt-4 h-10 w-full max-w-sm rounded-lg border px-3 text-sm"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {matching.length} products match these filters. Tick to pin specific SKUs.
        </p>
        <ul className="mt-3 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
          {visible.map((p) => (
            <li key={p.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border px-2 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() =>
                    setSelected((prev) => (prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]))
                  }
                />
                <span className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                  {p.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnail_url} alt="" className="size-10 object-cover" />
                  ) : null}
                </span>
                <span>
                  <span className="block font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.status}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <button type="submit" disabled={pending} className={cn(buttonVariants())}>
        {pending ? "Saving…" : "Create offer"}
      </button>
    </form>
  );
}
