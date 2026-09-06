import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, assertPasswordStrength } from "./password.js";
import { slugify, isSafeStorageKey } from "./ids.js";
import { assembleMenu, isLiveItem, isLiveCategory } from "./publicMenu.js";
import { itemFlags } from "./contentFlags.js";
import { itemWriteSchema, loginSchema, reorderSchema, bulkItemsSchema } from "../schemas.js";

describe("password", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("restaurant-secret");
    expect(hash.startsWith("scrypt:")).toBe(true);
    expect(await verifyPassword("restaurant-secret", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects short passwords", () => {
    expect(assertPasswordStrength("short")).toBeTruthy();
    expect(assertPasswordStrength("long-enough-password")).toBeNull();
  });
});

describe("ids", () => {
  it("slugifies latin names", () => {
    expect(slugify("Hot Dishes")).toBe("hot-dishes");
  });

  it("rejects path traversal keys", () => {
    expect(isSafeStorageKey("../etc/passwd")).toBe(false);
    expect(isSafeStorageKey("tabkha/dish/a.webp")).toBe(true);
  });
});

describe("content flags", () => {
  it("flags missing English without inventing a name", () => {
    const flags = itemFlags({
      nameEn: null,
      descriptionAr: null,
      descriptionEn: null,
      image: null,
      needsReview: false,
    });
    expect(flags.missingEn).toBe(true);
    expect(flags.missingImage).toBe(true);
    expect(flags.needsReview).toBe(true);
  });
});

describe("public menu assembly", () => {
  const restaurant = {
    id: "tabkha-and-more",
    nameAr: "طبخة",
    nameEn: "Tabkha",
    taglineAr: "ت",
    taglineEn: "t",
    storyAr: "س",
    storyEn: "s",
    logo: "/brand/petal-mark.svg",
    currency: "AED" as const,
    currencyLabelAr: "درهم",
  };

  const categories = [
    {
      id: "breakfast",
      nameAr: "الإفطار",
      nameEn: "Breakfast",
      descriptionAr: null,
      descriptionEn: null,
      image: "breakfast",
      displayOrder: 1,
      surface: "cream",
      scriptAccent: null,
      active: true,
      published: true,
    },
    {
      id: "hidden",
      nameAr: "مخفي",
      nameEn: "Hidden",
      descriptionAr: null,
      descriptionEn: null,
      image: "hidden",
      displayOrder: 2,
      surface: "cream",
      scriptAccent: null,
      active: true,
      published: false,
    },
  ];

  const items = [
    {
      id: "breakfast-1",
      categoryId: "breakfast",
      nameAr: "فول",
      nameEn: null,
      descriptionAr: null,
      descriptionEn: null,
      price: 18,
      currency: "AED",
      image: null,
      displayOrder: 1,
      portionNote: null,
      featured: false,
      available: true,
      active: true,
      published: true,
    },
    {
      id: "breakfast-2",
      categoryId: "breakfast",
      nameAr: "مخفي",
      nameEn: "Hidden dish",
      descriptionAr: null,
      descriptionEn: null,
      price: 20,
      currency: "AED",
      image: null,
      displayOrder: 2,
      portionNote: null,
      featured: false,
      available: false,
      active: true,
      published: true,
    },
    {
      id: "hidden-1",
      categoryId: "hidden",
      nameAr: "مسودة",
      nameEn: "Draft",
      descriptionAr: null,
      descriptionEn: null,
      price: 10,
      currency: "AED",
      image: null,
      displayOrder: 1,
      portionNote: null,
      featured: false,
      available: true,
      active: true,
      published: false,
    },
  ];

  it("hides drafts, unpublished categories, and unavailable dishes on the live menu", () => {
    const live = assembleMenu({ restaurant, categories, items, mode: "live" });
    expect(live.categories).toHaveLength(1);
    expect(live.categories[0].items.map((item) => item.id)).toEqual(["breakfast-1"]);
    expect(live.categories[0].items[0].nameEn).toBeNull();
  });

  it("shows drafts and unavailable dishes in preview", () => {
    const preview = assembleMenu({ restaurant, categories, items, mode: "preview" });
    expect(preview.categories).toHaveLength(2);
    expect(preview.categories[0].items).toHaveLength(2);
  });

  it("live helpers", () => {
    expect(isLiveCategory({ active: true, published: false })).toBe(false);
    expect(isLiveItem({ active: true, published: true, available: false })).toBe(false);
  });
});

describe("validation", () => {
  it("accepts a login payload", () => {
    expect(loginSchema.parse({ email: "owner@tabkha.ae", password: "secret" }).email).toBe("owner@tabkha.ae");
  });

  it("requires arabic name and price", () => {
    const result = itemWriteSchema.safeParse({
      categoryId: "breakfast",
      nameAr: "حمص",
      price: 18,
    });
    expect(result.success).toBe(true);
  });

  it("keeps english nullable", () => {
    const result = itemWriteSchema.parse({
      categoryId: "breakfast",
      nameAr: "فول باللبن",
      nameEn: null,
      price: 18,
    });
    expect(result.nameEn).toBeNull();
  });

  it("rejects bulk delete without ids", () => {
    expect(bulkItemsSchema.safeParse({ ids: [], action: "delete" }).success).toBe(false);
  });

  it("accepts reorder lists", () => {
    expect(reorderSchema.parse({ ids: ["a", "b"] }).ids).toEqual(["a", "b"]);
  });
});
