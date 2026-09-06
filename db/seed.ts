import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { and, eq } from "drizzle-orm";
import { getDb } from "./client.js";
import { categories, menuItems, restaurantUsers, restaurants, sessions, settings, users } from "./schema.js";
import { items, restaurant, categories as categorySeed } from "../src/data/menu.seed.js";
import { hashPassword, assertPasswordStrength } from "../server/lib/password.js";
import { newId } from "../server/lib/ids.js";
import { loadRestaurantMenu } from "../server/lib/loadMenu.js";

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
  const passwordHash = await hashPassword(password);
  const name = process.env.ADMIN_NAME?.trim() || "Tabkha";

  const [byEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (byEmail) {
    await db.update(users).set({ passwordHash, name }).where(eq(users.id, byEmail.id));
    const [link] = await db
      .select()
      .from(restaurantUsers)
      .where(and(eq(restaurantUsers.userId, byEmail.id), eq(restaurantUsers.restaurantId, restaurantId)))
      .limit(1);
    if (!link) {
      await db.insert(restaurantUsers).values({
        id: newId("ru"),
        userId: byEmail.id,
        restaurantId,
        role: "owner",
      });
    }
    await db.delete(sessions).where(eq(sessions.userId, byEmail.id));
    console.log(`Updated admin user ${email}`);
    return;
  }

  const [membership] = await db
    .select()
    .from(restaurantUsers)
    .where(eq(restaurantUsers.restaurantId, restaurantId))
    .limit(1);

  if (membership) {
    await db
      .update(users)
      .set({ email, passwordHash, name })
      .where(eq(users.id, membership.userId));
    await db.delete(sessions).where(eq(sessions.userId, membership.userId));
    console.log(`Updated admin user ${email}`);
    return;
  }

  const userId = newId("user");
  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
    name,
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
