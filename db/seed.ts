import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { getDb } from "./client.ts";
import { categories, menuItems, restaurantUsers, restaurants, settings, users } from "./schema.ts";
import { items, restaurant, categories as categorySeed } from "../src/data/menu.seed.ts";
import { hashPassword, assertPasswordStrength } from "../api/lib/password.ts";
import { newId } from "../api/lib/ids.ts";
import { loadRestaurantMenu } from "../api/lib/loadMenu.ts";

async function seed() {
  const db = getDb();

  await db
    .insert(restaurants)
    .values({
      id: restaurant.id,
      nameAr: restaurant.nameAr,
      nameEn: restaurant.nameEn,
      taglineAr: restaurant.taglineAr,
      taglineEn: restaurant.taglineEn,
      storyAr: restaurant.storyAr,
      storyEn: restaurant.storyEn,
      logo: restaurant.logo,
      currency: restaurant.currency,
      currencyLabelAr: restaurant.currencyLabelAr,
      defaultLocale: "ar",
    })
    .onConflictDoNothing();

  for (const category of categorySeed) {
    await db
      .insert(categories)
      .values({
        id: category.id,
        restaurantId: restaurant.id,
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        image: category.image,
        displayOrder: category.displayOrder,
        surface: category.surface,
        scriptAccent: category.scriptAccent,
        active: true,
        published: true,
        publishedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  for (const item of items) {
    await db
      .insert(menuItems)
      .values({
        id: item.id,
        categoryId: item.categoryId,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        descriptionAr: item.descriptionAr,
        descriptionEn: item.descriptionEn,
        price: item.price.toFixed(2),
        currency: item.currency,
        image: item.image,
        displayOrder: item.displayOrder,
        portionNote: item.portionNote,
        featured: item.featured,
        available: item.available,
        active: item.active,
        published: true,
        publishedAt: new Date(),
        needsReview: !item.nameEn,
      })
      .onConflictDoNothing();
  }

  await db
    .insert(settings)
    .values({
      id: "default-locale",
      restaurantId: restaurant.id,
      key: "default_locale",
      value: "ar",
    })
    .onConflictDoNothing();

  await seedAdmin(restaurant.id);

  const snapshot = await loadRestaurantMenu(restaurant.id, "live");
  const snapshotPath = resolve("src/data/generated/menu.json");
  writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`Seeded ${categorySeed.length} categories, ${items.length} items (existing rows left unchanged).`);
  console.log(`Wrote ${snapshotPath}`);
}

async function seedAdmin(restaurantId: string) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipped admin user.");
    return;
  }
  const weak = assertPasswordStrength(password);
  if (weak) {
    throw new Error(weak);
  }
  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }
  const userId = newId("user");
  await db.insert(users).values({
    id: userId,
    email,
    passwordHash: await hashPassword(password),
    name: process.env.ADMIN_NAME?.trim() || "Tabkha",
  });
  await db.insert(restaurantUsers).values({
    id: newId("ru"),
    userId,
    restaurantId,
    role: "owner",
  });
  console.log(`Created admin user ${email}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
