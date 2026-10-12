import { describe, expect, it } from "vitest";
import { formatIst, formatIstDate, istCalendarStamp, parseIstDatetimeLocal, startOfIstDay, toIstDatetimeLocal } from "./time";

describe("IST display", () => {
  it("formats an instant in Asia/Kolkata, not UTC", () => {
    expect(formatIst("2026-10-12T15:14:00.000Z")).toBe("12 Oct 2026, 8:44 pm IST");
  });

  it("formats a calendar date in IST", () => {
    expect(formatIstDate("2026-10-12T18:30:00.000Z")).toBe("13 Oct 2026");
  });

  it("stamps order numbers with the IST calendar day", () => {
    expect(istCalendarStamp(new Date("2026-10-12T18:30:00.000Z"))).toBe("20261013");
  });

  it("starts today at IST midnight", () => {
    expect(startOfIstDay(new Date("2026-10-12T20:00:00.000Z")).toISOString()).toBe("2026-10-12T18:30:00.000Z");
  });

  it("reads datetime-local fields as IST", () => {
    const parsed = parseIstDatetimeLocal("2026-10-12T20:44");
    expect(parsed.toISOString()).toBe("2026-10-12T15:14:00.000Z");
    expect(toIstDatetimeLocal(parsed)).toBe("2026-10-12T20:44");
  });
});
