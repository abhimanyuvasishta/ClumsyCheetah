import { describe, expect, it } from "vitest";
import { discountPercent, exclusiveOfGst, formatInr, lineTotalPaise, rupeesToPaise } from "./money";

describe("money", () => {
  it("formats paise as INR", () => {
    expect(formatInr(129900)).toBe("₹1,299");
  });

  it("computes discount percent from compare-at", () => {
    expect(discountPercent(129900, 149900)).toBe(13);
    expect(discountPercent(10000, null)).toBeNull();
  });

  it("computes line totals without trusting floats", () => {
    expect(lineTotalPaise(39900, 3)).toBe(119700);
  });

  it("converts rupees to paise on the server", () => {
    expect(rupeesToPaise("749")).toBe(74900);
    expect(rupeesToPaise("749.50")).toBe(74950);
  });

  it("shows 5% GST exclusive of listed price", () => {
    expect(exclusiveOfGst(10500)).toBe(10000);
  });
});
