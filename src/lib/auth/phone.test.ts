import { describe, expect, it } from "vitest";
import { toE164Phone } from "./phone";

describe("toE164Phone", () => {
  it("prefixes 10-digit Indian mobiles with +91", () => {
    expect(toE164Phone("9876543210")).toBe("+919876543210");
    expect(toE164Phone("98765 43210")).toBe("+919876543210");
  });

  it("keeps an existing +91 number", () => {
    expect(toE164Phone("+91 9876543210")).toBe("+919876543210");
  });

  it("rejects short numbers", () => {
    expect(toE164Phone("12345")).toBeNull();
  });
});
