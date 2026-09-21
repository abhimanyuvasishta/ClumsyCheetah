import { describe, expect, it } from "vitest";
import { cartSubtotal, type CartLine } from "./cart";

describe("cart", () => {
  it("sums line totals in paise", () => {
    const lines: CartLine[] = [
      {
        productId: "a",
        variantId: "v1",
        slug: "x",
        name: "Cake",
        variantName: "1 kg",
        image: null,
        unitPricePaise: 129900,
        compareAtPaise: null,
        quantity: 2,
      },
    ];
    expect(cartSubtotal(lines)).toBe(259800);
  });
});
