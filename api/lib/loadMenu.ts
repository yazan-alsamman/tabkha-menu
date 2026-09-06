import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../db/client.ts";
import { categories, menuItems, restaurants, settings } from "../../db/schema.ts";
import { buildMenuPayload } from "../../src/data/menu.seed.ts";
import { assembleMenu, toPublicRestaurant } from "./publicMenu.ts";
import type { MenuPayload } from "../../src/types/menu.ts";

export async function loadRestaurantMenu(restaurantId: string, mode: "live" | "preview"): Promise<MenuPayload> {
  const db = getDb();
  const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId)).limit(1);
  if (!restaurant) return buildMenuPayload();

  const categoryRows = await db
    .select()
    .from(categories)
    .where(eq(categories.restaurantId, restaurant.id))
    .orderBy(asc(categories.displayOrder));

  const itemRows = await db.select().from(menuItems).orderBy(asc(menuItems.displayOrder));

  return assembleMenu({
    restaurant: toPublicRestaurant(restaurant),
    categories: categoryRows,
    items: itemRows,
    mode,
  });
}

export async function loadPublicMenu(): Promise<MenuPayload> {
  try {
    const db = getDb();
    const [restaurant] = await db.select().from(restaurants).limit(1);
    if (!restaurant) return buildMenuPayload();
    return loadRestaurantMenu(restaurant.id, "live");
  } catch (error) {
    console.error(error);
    return buildMenuPayload();
  }
}

export async function loadPublicSettings() {
  try {
    const db = getDb();
    const [restaurant] = await db.select().from(restaurants).limit(1);
    if (!restaurant) return { defaultLocale: "ar" as const, currency: "AED" as const };
    const rows = await db.select().from(settings).where(eq(settings.restaurantId, restaurant.id));
    const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return {
      defaultLocale: (restaurant.defaultLocale === "en" ? "en" : "ar") as "ar" | "en",
      currency: restaurant.currency,
      qrUrl: restaurant.qrUrl,
      revision: map.menu_revision ?? "0",
    };
  } catch {
    return { defaultLocale: "ar" as const, currency: "AED" as const };
  }
}

export async function assertCategoryInRestaurant(categoryId: string, restaurantId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.restaurantId, restaurantId)))
    .limit(1);
  return row ?? null;
}
