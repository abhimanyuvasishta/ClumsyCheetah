import { describe, expect, it } from "vitest";
import { discountPercent, formatInr, lineTotalPaise } from "./money";

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
});
