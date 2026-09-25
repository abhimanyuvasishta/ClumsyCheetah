import { describe, expect, it } from "vitest";
import { indianMobileFromE164 } from "./sms";

describe("indianMobileFromE164", () => {
  it("strips +91 for 2Factor", () => {
    expect(indianMobileFromE164("+919876543210")).toBe("9876543210");
    expect(indianMobileFromE164("9876543210")).toBe("9876543210");
  });
});
