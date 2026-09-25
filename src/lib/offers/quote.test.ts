import { describe, expect, it } from "vitest";
import { exclusiveOfGst, gstPortionPaise } from "../money";
import { quoteOffer } from "./quote";
import { offerLifecycle, productMatchesOffer, type OfferRow } from "./types";

const offer = (over: Partial<OfferRow>): OfferRow => ({
  id: "o1",
  name: "Test",
  description: null,
  kind: "PERCENTAGE",
  coupon_code: "SWEET10",
  percent_off: 10,
  amount_off_paise: null,
  min_order_paise: 0,
  max_discount_paise: null,
  gift_product_id: null,
  applicable_product_ids: [],
  applicable_category_ids: [],
  filter_eggless: false,
  filter_vegetarian: false,
  filter_bestseller: false,
  filter_new_arrival: false,
  banner_text: null,
  show_banner: true,
  starts_at: new Date(Date.now() - 1000).toISOString(),
  ends_at: new Date(Date.now() + 86400000).toISOString(),
  is_active: true,
  usage_limit: null,
  created_at: new Date().toISOString(),
  ...over,
});

describe("gst display", () => {
  it("splits 5% GST out of inclusive paise", () => {
    expect(exclusiveOfGst(10500)).toBe(10000);
    expect(gstPortionPaise(10500)).toBe(500);
  });
});

describe("offers", () => {
  it("marks live vs upcoming vs expired", () => {
    const now = new Date("2026-09-25T12:00:00Z");
    expect(
      offerLifecycle(offer({ starts_at: "2026-09-24T00:00:00Z", ends_at: "2026-09-26T00:00:00Z" }), 0, now),
    ).toBe("live");
    expect(
      offerLifecycle(offer({ starts_at: "2026-09-26T00:00:00Z", ends_at: "2026-09-28T00:00:00Z" }), 0, now),
    ).toBe("upcoming");
    expect(
      offerLifecycle(offer({ starts_at: "2026-09-20T00:00:00Z", ends_at: "2026-09-21T00:00:00Z" }), 0, now),
    ).toBe("expired");
  });

  it("matches product filters", () => {
    const cake = {
      id: "p1",
      categoryId: "c1",
      isEggless: true,
      isVegetarian: true,
      isBestseller: false,
      isNewArrival: false,
    };
    expect(productMatchesOffer(cake, offer({ filter_eggless: true }))).toBe(true);
    expect(productMatchesOffer({ ...cake, isEggless: false }, offer({ filter_eggless: true }))).toBe(false);
    expect(productMatchesOffer(cake, offer({ applicable_product_ids: ["p2"] }))).toBe(false);
  });

  it("quotes percent off on eligible lines", () => {
    const result = quoteOffer(offer({ percent_off: 10 }), [
      { productId: "p1", quantity: 2, unitPaise: 50000 },
    ]);
    expect(result).toMatchObject({ discountPaise: 10000 });
  });
});
