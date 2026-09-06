import { Hono } from "hono";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "../../db/client.ts";
import { categories, menuItems } from "../../db/schema.ts";
import { loadRestaurantMenu } from "../lib/loadMenu.ts";
import { NO_STORE } from "../lib/cache.ts";
import { requireAuth, type AppEnv } from "../middleware/requireAuth.ts";

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.get("/admin/overview", requireAuth, async (c) => {
  const auth = c.get("auth");
  const db = getDb();
  const cats = await db.select().from(categories).where(eq(categories.restaurantId, auth.restaurantId));
  const catIds = cats.map((row) => row.id);
  const items = catIds.length
    ? await db.select().from(menuItems).where(inArray(menuItems.categoryId, catIds))
    : [];
  const lastCategory = cats.reduce((latest, row) => (row.updatedAt > latest ? row.updatedAt : latest), new Date(0));
  const lastItem = items.reduce((latest, row) => (row.updatedAt > latest ? row.updatedAt : latest), new Date(0));
  const lastUpdated = lastItem > lastCategory ? lastItem : lastCategory;
  c.header("Cache-Control", NO_STORE);
  return c.json({
    totals: {
      categories: cats.length,
      dishes: items.length,
      active: items.filter((row) => row.active && row.published && row.available).length,
      unavailable: items.filter((row) => !row.available).length,
      featured: items.filter((row) => row.featured).length,
      drafts: items.filter((row) => !row.published).length + cats.filter((row) => !row.published).length,
      missingPhotos: items.filter((row) => !row.image).length,
      missingEnglish: items.filter((row) => !row.nameEn).length,
      needsReview: items.filter((row) => row.needsReview || !row.nameEn).length,
    },
    lastUpdated: lastUpdated.getTime() ? lastUpdated.toISOString() : null,
  });
});

adminRoutes.get("/preview/menu", requireAuth, async (c) => {
  const auth = c.get("auth");
  const payload = await loadRestaurantMenu(auth.restaurantId, "preview");
  c.header("Cache-Control", NO_STORE);
  return c.json(payload);
});

