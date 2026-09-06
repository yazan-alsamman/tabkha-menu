import { Hono } from "hono";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../db/client.js";
import { categories, menuItems } from "../../db/schema.js";
import {
  availabilitySchema,
  bulkItemsSchema,
  idParam,
  itemQuerySchema,
  itemWriteSchema,
  reorderSchema,
} from "../schemas.js";
import { jsonError, HttpError } from "../lib/errors.js";
import { newId } from "../lib/ids.js";
import { bumpMenuRevision, NO_STORE } from "../lib/cache.js";
import { itemFlags } from "../lib/contentFlags.js";
import { requireAuth, type AppEnv } from "../middleware/requireAuth.js";
import { assertCategoryInRestaurant } from "../lib/loadMenu.js";

export const itemRoutes = new Hono<AppEnv>();

itemRoutes.get("/admin/menu-items", requireAuth, async (c) => {
  const parsedQuery = itemQuerySchema.safeParse(c.req.query());
  const query = parsedQuery.success ? parsedQuery.data : {};
  const auth = c.get("auth");
  const db = getDb();
  const ownedCats = await db
    .select({ id: categories.id, nameAr: categories.nameAr, nameEn: categories.nameEn })
    .from(categories)
    .where(eq(categories.restaurantId, auth.restaurantId));
  const ownedIds = ownedCats.map((row) => row.id);
  if (!ownedIds.length) {
    c.header("Cache-Control", NO_STORE);
    return c.json([]);
  }
  const rows = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.categoryId, ownedIds))
    .orderBy(asc(menuItems.displayOrder));
  const catMap = Object.fromEntries(ownedCats.map((row) => [row.id, row]));
  const search = query.search?.trim().toLowerCase();
  const filtered = rows.filter((row) => {
    if (query.categoryId && row.categoryId !== query.categoryId) return false;
    if (query.available === "true" && !row.available) return false;
    if (query.available === "false" && row.available) return false;
    if (query.featured === "true" && !row.featured) return false;
    if (query.featured === "false" && row.featured) return false;
    if (query.published === "true" && !row.published) return false;
    if (query.published === "false" && row.published) return false;
    const flags = itemFlags(row);
    if (query.missingEn === "true" && !flags.missingEn) return false;
    if (query.missingImage === "true" && !flags.missingImage) return false;
    if (query.needsReview === "true" && !flags.needsReview) return false;
    if (search) {
      const hay = `${row.nameAr} ${row.nameEn ?? ""} ${row.descriptionAr ?? ""} ${row.descriptionEn ?? ""}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
  c.header("Cache-Control", NO_STORE);
  return c.json(
    filtered.map((row) => ({
      ...row,
      price: Number(row.price),
      categoryNameAr: catMap[row.categoryId]?.nameAr ?? "",
      categoryNameEn: catMap[row.categoryId]?.nameEn ?? "",
      flags: itemFlags(row),
    })),
  );
});

itemRoutes.get("/admin/menu-items/:id", requireAuth, async (c) => {
  try {
    const parsed = idParam.safeParse(c.req.param());
    if (!parsed.success) throw new HttpError(400, "invalid_id", "Invalid dish.");
    const auth = c.get("auth");
    const row = await loadOwnedItem(parsed.data.id, auth.restaurantId);
    if (!row) throw new HttpError(404, "not_found", "Dish not found.");
    c.header("Cache-Control", NO_STORE);
    return c.json({ ...row, price: Number(row.price), flags: itemFlags(row) });
  } catch (error) {
    return jsonError(c, error);
  }
});

itemRoutes.post("/menu-items", requireAuth, async (c) => {
  try {
    const parsed = itemWriteSchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HttpError(400, "invalid_input", "Check the dish fields.", flattenZod(parsed.error));
    const auth = c.get("auth");
    const category = await assertCategoryInRestaurant(parsed.data.categoryId, auth.restaurantId);
    if (!category) throw new HttpError(400, "invalid_input", "Choose a valid category.");
    const db = getDb();
    const siblings = await db.select({ displayOrder: menuItems.displayOrder }).from(menuItems).where(eq(menuItems.categoryId, category.id));
    const published = parsed.data.published ?? false;
    const [row] = await db
      .insert(menuItems)
      .values({
        id: parsed.data.id ?? newId("dish"),
        categoryId: category.id,
        nameAr: parsed.data.nameAr,
        nameEn: emptyToNull(parsed.data.nameEn),
        descriptionAr: emptyToNull(parsed.data.descriptionAr),
        descriptionEn: emptyToNull(parsed.data.descriptionEn),
        price: parsed.data.price.toFixed(2),
        currency: "AED",
        image: emptyToNull(parsed.data.image),
        displayOrder: parsed.data.displayOrder ?? siblings.length + 1,
        portionNote: emptyToNull(parsed.data.portionNote),
        featured: parsed.data.featured ?? false,
        available: parsed.data.available ?? true,
        active: parsed.data.active ?? true,
        published,
        publishedAt: published ? new Date() : null,
        needsReview: parsed.data.needsReview ?? false,
        dietaryTags: emptyToNull(parsed.data.dietaryTags),
        allergens: emptyToNull(parsed.data.allergens),
        spicyLevel: parsed.data.spicyLevel ?? null,
        updatedBy: auth.userId,
      })
      .returning();
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ...row, price: Number(row!.price), flags: itemFlags(row!) }, 201);
  } catch (error) {
    return jsonError(c, error);
  }
});

itemRoutes.put("/menu-items/:id", requireAuth, async (c) => {
  try {
    const id = idParam.safeParse(c.req.param());
    if (!id.success) throw new HttpError(400, "invalid_id", "Invalid dish.");
    const parsed = itemWriteSchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HttpError(400, "invalid_input", "Check the dish fields.", flattenZod(parsed.error));
    const auth = c.get("auth");
    const current = await loadOwnedItem(id.data.id, auth.restaurantId);
    if (!current) throw new HttpError(404, "not_found", "Dish not found.");
    const category = await assertCategoryInRestaurant(parsed.data.categoryId, auth.restaurantId);
    if (!category) throw new HttpError(400, "invalid_input", "Choose a valid category.");
    const published = parsed.data.published ?? current.published;
    const db = getDb();
    const [row] = await db
      .update(menuItems)
      .set({
        categoryId: category.id,
        nameAr: parsed.data.nameAr,
        nameEn: emptyToNull(parsed.data.nameEn),
        descriptionAr: emptyToNull(parsed.data.descriptionAr),
        descriptionEn: emptyToNull(parsed.data.descriptionEn),
        price: parsed.data.price.toFixed(2),
        image: parsed.data.image === undefined ? current.image : emptyToNull(parsed.data.image),
        portionNote: emptyToNull(parsed.data.portionNote),
        featured: parsed.data.featured ?? current.featured,
        available: parsed.data.available ?? current.available,
        active: parsed.data.active ?? current.active,
        published,
        publishedAt: published ? (current.publishedAt ?? new Date()) : current.publishedAt,
        needsReview: parsed.data.needsReview ?? current.needsReview,
        displayOrder: parsed.data.displayOrder ?? current.displayOrder,
        dietaryTags: emptyToNull(parsed.data.dietaryTags),
        allergens: emptyToNull(parsed.data.allergens),
        spicyLevel: parsed.data.spicyLevel === undefined ? current.spicyLevel : parsed.data.spicyLevel,
        updatedBy: auth.userId,
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, current.id))
      .returning();
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ...row, price: Number(row!.price), flags: itemFlags(row!) });
  } catch (error) {
    return jsonError(c, error);
  }
});

itemRoutes.delete("/menu-items/:id", requireAuth, async (c) => {
  try {
    const parsed = idParam.safeParse(c.req.param());
    if (!parsed.success) throw new HttpError(400, "invalid_id", "Invalid dish.");
    const auth = c.get("auth");
    const current = await loadOwnedItem(parsed.data.id, auth.restaurantId);
    if (!current) throw new HttpError(404, "not_found", "Dish not found.");
    await getDb().delete(menuItems).where(eq(menuItems.id, current.id));
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ok: true });
  } catch (error) {
    return jsonError(c, error);
  }
});

itemRoutes.patch("/menu-items/reorder", requireAuth, async (c) => {
  try {
    const parsed = reorderSchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HttpError(400, "invalid_input", "Provide the dish order.");
    const auth = c.get("auth");
    const owned = await Promise.all(parsed.data.ids.map((id) => loadOwnedItem(id, auth.restaurantId)));
    if (owned.some((row) => !row)) {
      throw new HttpError(403, "forbidden", "One or more dishes do not belong to this restaurant.");
    }
    const db = getDb();
    await Promise.all(
      parsed.data.ids.map((id, index) =>
        db
          .update(menuItems)
          .set({ displayOrder: index + 1, updatedAt: new Date(), updatedBy: auth.userId })
          .where(eq(menuItems.id, id)),
      ),
    );
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ok: true });
  } catch (error) {
    return jsonError(c, error);
  }
});

itemRoutes.patch("/menu-items/:id/availability", requireAuth, async (c) => {
  try {
    const id = idParam.safeParse(c.req.param());
    if (!id.success) throw new HttpError(400, "invalid_id", "Invalid dish.");
    const parsed = availabilitySchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HttpError(400, "invalid_input", "Provide availability.");
    const auth = c.get("auth");
    const current = await loadOwnedItem(id.data.id, auth.restaurantId);
    if (!current) throw new HttpError(404, "not_found", "Dish not found.");
    const [row] = await getDb()
      .update(menuItems)
      .set({ available: parsed.data.available, updatedAt: new Date(), updatedBy: auth.userId })
      .where(eq(menuItems.id, current.id))
      .returning();
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ...row, price: Number(row!.price), flags: itemFlags(row!) });
  } catch (error) {
    return jsonError(c, error);
  }
});

itemRoutes.post("/menu-items/:id/duplicate", requireAuth, async (c) => {
  try {
    const parsed = idParam.safeParse(c.req.param());
    if (!parsed.success) throw new HttpError(400, "invalid_id", "Invalid dish.");
    const auth = c.get("auth");
    const current = await loadOwnedItem(parsed.data.id, auth.restaurantId);
    if (!current) throw new HttpError(404, "not_found", "Dish not found.");
    const db = getDb();
    const siblings = await db.select({ displayOrder: menuItems.displayOrder }).from(menuItems).where(eq(menuItems.categoryId, current.categoryId));
    const [row] = await db
      .insert(menuItems)
      .values({
        id: newId("dish"),
        categoryId: current.categoryId,
        nameAr: `${current.nameAr} (نسخة)`,
        nameEn: current.nameEn ? `${current.nameEn} (copy)` : null,
        descriptionAr: current.descriptionAr,
        descriptionEn: current.descriptionEn,
        price: current.price,
        currency: current.currency,
        image: current.image,
        displayOrder: siblings.length + 1,
        portionNote: current.portionNote,
        featured: false,
        available: current.available,
        active: true,
        published: false,
        publishedAt: null,
        needsReview: true,
        dietaryTags: current.dietaryTags,
        allergens: current.allergens,
        spicyLevel: current.spicyLevel,
        updatedBy: auth.userId,
      })
      .returning();
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ...row, price: Number(row!.price), flags: itemFlags(row!) }, 201);
  } catch (error) {
    return jsonError(c, error);
  }
});

itemRoutes.post("/menu-items/bulk", requireAuth, async (c) => {
  try {
    const parsed = bulkItemsSchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HttpError(400, "invalid_input", "Check the bulk action.");
    const auth = c.get("auth");
    const owned = await Promise.all(parsed.data.ids.map((id) => loadOwnedItem(id, auth.restaurantId)));
    if (owned.some((row) => !row)) {
      throw new HttpError(403, "forbidden", "One or more dishes do not belong to this restaurant.");
    }
    const db = getDb();
    if (parsed.data.action === "delete") {
      await db.delete(menuItems).where(inArray(menuItems.id, parsed.data.ids));
    } else if (parsed.data.action === "show" || parsed.data.action === "hide") {
      await db
        .update(menuItems)
        .set({ available: parsed.data.action === "show", updatedAt: new Date(), updatedBy: auth.userId })
        .where(inArray(menuItems.id, parsed.data.ids));
    } else if (parsed.data.action === "category") {
      if (!parsed.data.categoryId) throw new HttpError(400, "invalid_input", "Choose a category.");
      const category = await assertCategoryInRestaurant(parsed.data.categoryId, auth.restaurantId);
      if (!category) throw new HttpError(400, "invalid_input", "Choose a valid category.");
      await db
        .update(menuItems)
        .set({ categoryId: category.id, updatedAt: new Date(), updatedBy: auth.userId })
        .where(inArray(menuItems.id, parsed.data.ids));
    }
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ok: true, count: parsed.data.ids.length });
  } catch (error) {
    return jsonError(c, error);
  }
});

async function loadOwnedItem(id: string, restaurantId: string) {
  const db = getDb();
  const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!row) return null;
  const category = await assertCategoryInRestaurant(row.categoryId, restaurantId);
  if (!category) return null;
  return row;
}

function emptyToNull(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function flattenZod(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!details[key]) details[key] = issue.message;
  }
  return details;
}
