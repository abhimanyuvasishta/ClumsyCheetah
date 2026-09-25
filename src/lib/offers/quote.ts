import { lineTotalPaise } from "@/lib/money";
import { productMatchesOffer, type OfferRow } from "@/lib/offers/types";

export type PricedOfferLine = {
  productId: string;
  quantity: number;
  unitPaise: number;
  categoryId?: string | null;
  isEggless?: boolean;
  isVegetarian?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
};

export type OfferQuote = {
  offer: OfferRow;
  discountPaise: number;
  giftProductId: string | null;
  message: string;
  eligibleSubtotalPaise: number;
};

export function quoteOffer(offer: OfferRow, lines: PricedOfferLine[]): OfferQuote | { error: string } {
  const eligible = lines.filter((line) =>
    productMatchesOffer(
      {
        id: line.productId,
        categoryId: line.categoryId ?? null,
        isEggless: Boolean(line.isEggless),
        isVegetarian: Boolean(line.isVegetarian),
        isBestseller: Boolean(line.isBestseller),
        isNewArrival: Boolean(line.isNewArrival),
      },
      offer,
    ),
  );
  const eligibleSubtotal = eligible.reduce((sum, line) => sum + lineTotalPaise(line.unitPaise, line.quantity), 0);
  const bagSubtotal = lines.reduce((sum, line) => sum + lineTotalPaise(line.unitPaise, line.quantity), 0);
  if (bagSubtotal < offer.min_order_paise) {
    return { error: `Add ₹${Math.ceil((offer.min_order_paise - bagSubtotal) / 100)} more to use this offer` };
  }

  if (offer.kind === "PERCENTAGE") {
    const pct = Number(offer.percent_off ?? 0);
    if (pct <= 0 || !eligible.length) return { error: "This offer does not apply to the items in your bag" };
    let discount = Math.round((eligibleSubtotal * pct) / 100);
    if (offer.max_discount_paise != null) discount = Math.min(discount, offer.max_discount_paise);
    discount = Math.min(discount, eligibleSubtotal);
    return {
      offer,
      discountPaise: discount,
      giftProductId: null,
      eligibleSubtotalPaise: eligibleSubtotal,
      message: `${pct}% off`,
    };
  }

  if (offer.kind === "FIXED") {
    if (!eligible.length) return { error: "This offer does not apply to the items in your bag" };
    const discount = Math.min(offer.amount_off_paise ?? 0, eligibleSubtotal);
    if (discount <= 0) return { error: "This offer has no discount left" };
    return {
      offer,
      discountPaise: discount,
      giftProductId: null,
      eligibleSubtotalPaise: eligibleSubtotal,
      message: `₹${Math.round(discount / 100)} off`,
    };
  }

  if (offer.kind === "FREE_DELIVERY") {
    return {
      offer,
      discountPaise: 0,
      giftProductId: null,
      eligibleSubtotalPaise: bagSubtotal,
      message: "Delivery is on us",
    };
  }

  if (offer.kind === "FREE_GIFT") {
    if (!offer.gift_product_id) return { error: "This gift offer is not set up" };
    return {
      offer,
      discountPaise: 0,
      giftProductId: offer.gift_product_id,
      eligibleSubtotalPaise: bagSubtotal,
      message: "Free gift added",
    };
  }

  return { error: "Unknown offer type" };
}
