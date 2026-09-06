import { describe, expect, it } from "vitest";
import { formatPrice, itemName } from "./format";

describe("formatPrice", () => {
  it("uses درهم in Arabic", () => {
    expect(formatPrice(42, "ar")).toBe("42 درهم");
  });

  it("uses AED in English", () => {
    expect(formatPrice(42, "en")).toBe("42 AED");
  });
});

describe("itemName", () => {
  it("falls back to Arabic when English is missing", () => {
    expect(itemName("en", "منقوشة عكاوي", null)).toBe("منقوشة عكاوي");
  });
});
