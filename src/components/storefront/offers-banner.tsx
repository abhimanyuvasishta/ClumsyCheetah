"use client";

import { offerLabel, type OfferRow } from "@/lib/offers/types";
import { useLiveOffers } from "@/components/storefront/shop-commerce";

export function OffersBanner() {
  const offers = useLiveOffers().filter((o: OfferRow) => o.show_banner);
  if (!offers.length) return null;
  return (
    <div className="border-b bg-gold/40">
      <div className="store-wrap flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2 text-center text-sm">
        {offers.map((offer) => (
          <p key={offer.id}>
            <span className="font-medium">{offer.banner_text || offer.name}</span>
            <span className="text-muted-foreground"> · {offerLabel(offer)}</span>
            {offer.coupon_code ? <span className="ml-1 font-mono text-xs">Code {offer.coupon_code}</span> : null}
          </p>
        ))}
      </div>
    </div>
  );
}
