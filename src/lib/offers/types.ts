export type OfferKind = "PERCENTAGE" | "FIXED" | "FREE_DELIVERY" | "FREE_GIFT";
export type OfferLifecycle = "upcoming" | "live" | "expired" | "completed";

export type OfferRow = {
  id: string;
  name: string;
  description: string | null;
  kind: OfferKind;
  coupon_code: string | null;
  percent_off: number | null;
  amount_off_paise: number | null;
  min_order_paise: number;
  max_discount_paise: number | null;
  gift_product_id: string | null;
  applicable_product_ids: string[];
  applicable_category_ids: string[];
  filter_eggless: boolean;
  filter_vegetarian: boolean;
  filter_bestseller: boolean;
  filter_new_arrival: boolean;
  banner_text: string | null;
  show_banner: boolean;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  usage_limit: number | null;
  created_at: string;
};

export type OfferProductHint = {
  id: string;
  categoryId: string | null;
  isEggless: boolean;
  isVegetarian: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
};

export function offerLifecycle(offer: OfferRow, redemptionCount = 0, now = new Date()): OfferLifecycle {
  const start = new Date(offer.starts_at);
  const end = new Date(offer.ends_at);
  if (offer.usage_limit != null && redemptionCount >= offer.usage_limit) return "completed";
  if (now < start) return offer.is_active ? "upcoming" : "completed";
  if (now > end) return "expired";
  if (!offer.is_active) return "completed";
  return "live";
}

export type OfferTarget = Pick<
  OfferRow,
  | "applicable_product_ids"
  | "applicable_category_ids"
  | "filter_eggless"
  | "filter_vegetarian"
  | "filter_bestseller"
  | "filter_new_arrival"
>;

export function productMatchesOffer(product: OfferProductHint, offer: OfferTarget): boolean {
  const productIds = offer.applicable_product_ids ?? [];
  const categoryIds = offer.applicable_category_ids ?? [];
  const targeted = productIds.length > 0 || categoryIds.length > 0;
  if (targeted) {
    const inProducts = productIds.includes(product.id);
    const inCategory = Boolean(product.categoryId && categoryIds.includes(product.categoryId));
    if (!inProducts && !inCategory) return false;
  }
  if (offer.filter_eggless && !product.isEggless) return false;
  if (offer.filter_vegetarian && !product.isVegetarian) return false;
  if (offer.filter_bestseller && !product.isBestseller) return false;
  if (offer.filter_new_arrival && !product.isNewArrival) return false;
  return true;
}

export function liveOffersForProduct(offers: OfferRow[], product: OfferProductHint): OfferRow[] {
  return offers.filter((offer) => productMatchesOffer(product, offer));
}

export function offerLabel(offer: OfferRow): string {
  if (offer.kind === "PERCENTAGE" && offer.percent_off) return `${offer.percent_off}% off`;
  if (offer.kind === "FIXED" && offer.amount_off_paise) return `₹${Math.round(offer.amount_off_paise / 100)} off`;
  if (offer.kind === "FREE_DELIVERY") return "Free delivery";
  if (offer.kind === "FREE_GIFT") return "Free gift";
  return offer.name;
}
