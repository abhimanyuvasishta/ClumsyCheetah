import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { OfferRow } from "@/lib/offers/types";
import { offerLifecycle } from "@/lib/offers/types";

const columns =
  "id, name, description, kind, coupon_code, percent_off, amount_off_paise, min_order_paise, max_discount_paise, gift_product_id, applicable_product_ids, applicable_category_ids, filter_eggless, filter_vegetarian, filter_bestseller, filter_new_arrival, banner_text, show_banner, starts_at, ends_at, is_active, usage_limit, created_at";

export async function listLiveOffers(): Promise<OfferRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createPublicSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("offers").select(columns).eq("is_active", true);
  if (error || !data) return [];
  const now = new Date();
  return (data as OfferRow[]).filter((offer) => offerLifecycle(offer, 0, now) === "live");
}

export async function getOfferByCode(code: string): Promise<OfferRow | null> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;
  if (!isSupabaseConfigured()) return null;
  const supabase = createPublicSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("offers").select(columns).eq("coupon_code", trimmed).maybeSingle();
  if (error || !data) return null;
  return data as OfferRow;
}
