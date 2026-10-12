import { describe, expect, it } from "vitest";
import { ceilToQuarterHour, etaQuarterHourSlots, hoursFromProducts, sanitizeEtaMessage } from "./eta";

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

describe("ETA quarter hours", () => {
  it("ceils to the next 15 minutes", () => {
    expect(ceilToQuarterHour(new Date("2026-10-12T15:01:00.000Z")).toISOString()).toBe("2026-10-12T15:15:00.000Z");
    expect(ceilToQuarterHour(new Date("2026-10-12T15:15:00.000Z")).toISOString()).toBe("2026-10-12T15:15:00.000Z");
  });

  it("lists 15 minute slots", () => {
    const slots = etaQuarterHourSlots(new Date("2026-10-12T15:01:00.000Z"), 1);
    expect(slots[0]?.value).toBe("2026-10-12T15:15:00.000Z");
    expect(slots).toHaveLength(4);
  });

  it("trims kitchen messages", () => {
    expect(sanitizeEtaMessage("  Running 20 min late.  ")).toBe("Running 20 min late.");
    expect(sanitizeEtaMessage("   ")).toBeNull();
  });
});

