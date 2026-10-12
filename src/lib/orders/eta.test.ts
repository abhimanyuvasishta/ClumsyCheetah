import { describe, expect, it } from "vitest";
import { hoursFromProducts } from "./eta";

describe("hoursFromProducts", () => {
  it("uses the longest prep plus delivery", () => {
    expect(
      hoursFromProducts([
        { preparation_time_hours: 2, delivery_time_hours: 1 },
        { preparation_time_hours: 4, delivery_time_hours: 2 },
      ]),
    ).toBe(6);
  });

  it("falls back to 4 hours", () => {
    expect(hoursFromProducts([])).toBe(4);
  });
});
