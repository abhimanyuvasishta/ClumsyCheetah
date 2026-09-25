import Link from "next/link";
import Image from "next/image";
import { listAdminOffers, listOfferPickerProducts, recommendOffersFromSales } from "@/lib/offers/admin";
import { offerLabel } from "@/lib/offers/types";
import { setOfferActive } from "@/app/admin/offers/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sqlHint = `Run supabase/migrations/20260925120000_offers.sql in the Supabase SQL editor so the Offers tab can save live windows, coupons, and redemptions.`;

export default async function AdminOffersPage() {
  const [{ offers, missingTable, error }, products, recs] = await Promise.all([
    listAdminOffers(),
    listOfferPickerProducts().catch(() => []),
    recommendOffersFromSales().catch(() => []),
  ]);
  const byId = new Map(products.map((p) => [p.id, p]));
  const groups = {
    live: offers.filter((o) => o.lifecycle === "live"),
    upcoming: offers.filter((o) => o.lifecycle === "upcoming"),
    expired: offers.filter((o) => o.lifecycle === "expired"),
    completed: offers.filter((o) => o.lifecycle === "completed"),
  } as const;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Offers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live, upcoming, expired, and completed windows. Shop only shows live.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/offers/report" className={cn(buttonVariants({ variant: "outline" }))}>
            Report
          </Link>
          <Link href="/admin/offers/new" className={cn(buttonVariants())}>
            New offer
          </Link>
        </div>
      </div>
      {missingTable || error ? (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm">{error ?? sqlHint}</p>
      ) : null}

      {(Object.keys(groups) as (keyof typeof groups)[]).map((key) => (
        <section key={key} className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {key} ({groups[key].length})
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border bg-white">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b bg-[oklch(0.98_0.004_250)] text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Offer</th>
                  <th className="px-3 py-2">Products</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Window</th>
                  <th className="px-3 py-2">Used</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {groups[key].map((offer) => {
                  const thumbs = (offer.applicable_product_ids ?? []).map((id) => byId.get(id)).filter(Boolean).slice(0, 4);
                  return (
                    <tr key={offer.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <p className="font-medium">{offer.name}</p>
                        <p className="text-xs text-muted-foreground">{offerLabel(offer)}</p>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex -space-x-2">
                          {thumbs.map((p) =>
                            p?.thumbnail_url ? (
                              <Image
                                key={p.id}
                                src={p.thumbnail_url}
                                alt={p.name}
                                width={36}
                                height={36}
                                className="size-9 rounded border bg-white object-cover"
                              />
                            ) : (
                              <span key={p?.id} className="size-9 rounded border bg-muted" />
                            ),
                          )}
                          {!thumbs.length ? <span className="text-xs text-muted-foreground">Shop-wide / filters</span> : null}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{offer.coupon_code ?? "—"}</td>
                      <td className="px-3 py-2 text-xs">
                        {new Date(offer.starts_at).toLocaleString("en-IN")} → {new Date(offer.ends_at).toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {offer.redemptionCount}
                        {offer.usage_limit ? ` / ${offer.usage_limit}` : ""}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <form action={setOfferActive}>
                          <input type="hidden" name="id" value={offer.id} />
                          <input type="hidden" name="is_active" value={offer.is_active ? "false" : "true"} />
                          <button type="submit" className="text-xs underline">
                            {offer.is_active ? "End" : "Reactivate"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
                {!groups[key].length ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      None {key}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recommended from last 30 days</h2>
        <p className="mt-1 text-sm text-muted-foreground">Average units per day from paid orders. Slow movers get a discount idea; winners get a gift idea.</p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {recs.map((row) => (
            <li key={row.productId} className="flex gap-3 rounded-lg border bg-white p-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded bg-muted">
                {row.thumbnailUrl ? (
                  <Image src={row.thumbnailUrl} alt="" fill className="object-cover" />
                ) : null}
              </div>
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.unitsLast30} units / 30d · avg {row.avgDaily}/day
                </p>
                <p className="mt-1 text-sm">{row.suggestion}</p>
              </div>
            </li>
          ))}
          {!recs.length ? <p className="text-sm text-muted-foreground">No catalog yet, or sales tables are empty.</p> : null}
        </ul>
      </section>
    </div>
  );
}
