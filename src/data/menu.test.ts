import { describe, expect, it } from "vitest";
import { buildMenuPayload, categories, items } from "@/data/menu.seed";

describe("menu seed", () => {
  it("has fourteen categories in print order", () => {
    expect(categories).toHaveLength(14);
    expect(categories.map((c) => c.id)).toEqual([
      "breakfast",
      "soups",
      "salads-east",
      "doughs",
      "cold-appetizers",
      "hot-appetizers",
      "hot-dishes-eastern",
      "hot-dishes-western",
      "pizza",
      "pasta",
      "sandwich-eastern",
      "sandwich-western",
      "grills",
      "daily-dish",
    ]);
  });

  it("keeps Arabic names on every item", () => {
    expect(items.every((item) => item.nameAr.length > 0)).toBe(true);
    expect(items.every((item) => item.price > 0)).toBe(true);
  });

  it("nests items under the matching category", () => {
    const payload = buildMenuPayload();
    const nested = payload.categories.reduce((sum, category) => sum + category.items.length, 0);
    expect(nested).toBe(items.length);
  });
});
