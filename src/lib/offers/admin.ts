import { privilegedDb, staffDb } from "@/lib/admin/access";
import { offerLifecycle, type OfferLifecycle, type OfferRow } from "@/lib/offers/types";

const columns =
  "id, name, description, kind, coupon_code, percent_off, amount_off_paise, min_order_paise, max_discount_paise, gift_product_id, applicable_product_ids, applicable_category_ids, filter_eggless, filter_vegetarian, filter_bestseller, filter_new_arrival, banner_text, show_banner, starts_at, ends_at, is_active, usage_limit, created_at";

export type AdminOffer = OfferRow & { lifecycle: OfferLifecycle; redemptionCount: number };

export type OfferPickerProduct = {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string | null;
  primary_category_id: string | null;
  is_eggless: boolean;
  is_vegetarian: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  status: string;
};

export type OfferRecommendation = {
  productId: string;
  name: string;
  thumbnailUrl: string | null;
  unitsLast30: number;
  avgDaily: number;
  suggestion: string;
  suggestedKind: "PERCENTAGE" | "FREE_GIFT" | "FIXED";
  suggestedPercent: number | null;
};

export type OfferReportRow = {
  offer: OfferRow;
  lifecycle: OfferLifecycle;
  redemptions: number;
  discountPaise: number;
  orderTotalPaise: number;
};

export async function listAdminOffers(): Promise<{ offers: AdminOffer[]; missingTable: boolean; error?: string }> {
  try {
    const supabase = await staffDb();
    const { data, error } = await supabase.from("offers").select(columns).order("starts_at", { ascending: false });
    if (error) {
      const missing = /does not exist|schema cache/i.test(error.message);
      return { offers: [], missingTable: missing, error: error.message };
    }
    const offers = (data ?? []) as OfferRow[];
    const ids = offers.map((o) => o.id);
    const counts = new Map<string, number>();
    if (ids.length) {
      const { data: redemptions } = await supabase.from("offer_redemptions").select("offer_id").in("offer_id", ids);
      for (const row of redemptions ?? []) {
        counts.set(row.offer_id, (counts.get(row.offer_id) ?? 0) + 1);
      }
    }
    return {
      missingTable: false,
      offers: offers.map((offer) => {
        const redemptionCount = counts.get(offer.id) ?? 0;
        return { ...offer, redemptionCount, lifecycle: offerLifecycle(offer, redemptionCount) };
      }),
    };
  } catch (err) {
    return { offers: [], missingTable: false, error: err instanceof Error ? err.message : "Could not load offers" };
  }
}

export async function listOfferPickerProducts(): Promise<OfferPickerProduct[]> {
  const supabase = await staffDb();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, thumbnail_url, primary_category_id, is_eggless, is_vegetarian, is_bestseller, is_new_arrival, status")
    .is("deleted_at", null)
    .order("name");
  return (data ?? []) as OfferPickerProduct[];
}

export async function recommendOffersFromSales(): Promise<OfferRecommendation[]> {
  const supabase = await privilegedDb();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity, created_at, products:product_id (id, name, thumbnail_url, deleted_at)")
    .gte("created_at", since.toISOString());

  const units = new Map<string, { name: string; thumbnailUrl: string | null; qty: number }>();
  for (const row of items ?? []) {
    const productRaw = row.products as
      | { id: string; name: string; thumbnail_url: string | null; deleted_at: string | null }
      | { id: string; name: string; thumbnail_url: string | null; deleted_at: string | null }[]
      | null;
    const product = Array.isArray(productRaw) ? productRaw[0] : productRaw;
    if (!product || product.deleted_at) continue;
    const prev = units.get(product.id) ?? { name: product.name, thumbnailUrl: product.thumbnail_url, qty: 0 };
    prev.qty += row.quantity ?? 0;
    units.set(product.id, prev);
  }

  const { data: catalog } = await supabase
    .from("products")
    .select("id, name, thumbnail_url")
    .eq("status", "ACTIVE")
    .is("deleted_at", null);

  for (const product of catalog ?? []) {
    if (!units.has(product.id)) {
      units.set(product.id, { name: product.name, thumbnailUrl: product.thumbnail_url, qty: 0 });
    }
  }

  const rows = [...units.entries()].map(([productId, row]) => ({
    productId,
    name: row.name,
    thumbnailUrl: row.thumbnailUrl,
    unitsLast30: row.qty,
    avgDaily: Math.round((row.qty / 30) * 100) / 100,
  }));
  const sold = rows.filter((r) => r.unitsLast30 > 0).map((r) => r.unitsLast30).sort((a, b) => a - b);
  const median = sold.length ? sold[Math.floor(sold.length / 2)] : 0;

  return rows
    .sort((a, b) => a.unitsLast30 - b.unitsLast30)
    .slice(0, 24)
    .map((row) => {
      if (row.unitsLast30 === 0) {
        return {
          ...row,
          suggestion: "No sales in 30 days — run 15% off for a week to get it moving.",
          suggestedKind: "PERCENTAGE" as const,
          suggestedPercent: 15,
        };
      }
      if (median && row.unitsLast30 < median) {
        return {
          ...row,
          suggestion: `Below median (${median} units / 30d). Try 10% off on this bake.`,
          suggestedKind: "PERCENTAGE" as const,
          suggestedPercent: 10,
        };
      }
      return {
        ...row,
        suggestion: "Selling well — protect the price and attach a free-gift offer.",
        suggestedKind: "FREE_GIFT" as const,
        suggestedPercent: null,
      };
    });
}

export async function offerReport(): Promise<{ rows: OfferReportRow[]; missingTable: boolean }> {
  const { offers, missingTable } = await listAdminOffers();
  if (missingTable) return { rows: [], missingTable: true };
  const supabase = await staffDb();
  const { data: redemptions } = await supabase
    .from("offer_redemptions")
    .select("offer_id, discount_paise, order_id, orders:order_id (total_paise)");

  const byOffer = new Map<string, { count: number; discount: number; total: number }>();
  for (const row of redemptions ?? []) {
    const prev = byOffer.get(row.offer_id) ?? { count: 0, discount: 0, total: 0 };
    prev.count += 1;
    prev.discount += row.discount_paise ?? 0;
    const orderRaw = row.orders as { total_paise: number } | { total_paise: number }[] | null;
    const order = Array.isArray(orderRaw) ? orderRaw[0] : orderRaw;
    prev.total += order?.total_paise ?? 0;
    byOffer.set(row.offer_id, prev);
  }

  return {
    missingTable: false,
    rows: offers.map((offer) => {
      const stats = byOffer.get(offer.id) ?? { count: 0, discount: 0, total: 0 };
      return {
        offer,
        lifecycle: offer.lifecycle,
        redemptions: stats.count,
        discountPaise: stats.discount,
        orderTotalPaise: stats.total,
      };
    }),
  };
}
