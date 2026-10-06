import { describe, expect, it } from "vitest";
import { coverImage, isUploadedImage, resolveMenuImage } from "./images";

describe("resolveMenuImage", () => {
  it("keeps uploaded blob and api urls", () => {
    const blob = "https://example.blob.vercel-storage.com/tabkha/category/abc/900.webp";
    expect(isUploadedImage(blob)).toBe(true);
    expect(resolveMenuImage(blob).src).toBe(blob);
    expect(resolveMenuImage("/api/media/file/tabkha/dish/abc/900.webp").src).toBe(
      "/api/media/file/tabkha/dish/abc/900.webp",
    );
  });

  it("maps bundled category slugs to local webp files", () => {
    const image = resolveMenuImage("breakfast");
    expect(image.src).toContain("/images/categories/breakfast-");
    expect(image.src.endsWith(".webp")).toBe(true);
  });

  it("prefers a dish cover over the category cover", () => {
    const dish = coverImage("https://cdn.example/dish.webp", "breakfast");
    expect(dish.src).toBe("https://cdn.example/dish.webp");
    const fallback = coverImage(null, "https://cdn.example/category.webp");
    expect(fallback.src).toBe("https://cdn.example/category.webp");
  });
});
