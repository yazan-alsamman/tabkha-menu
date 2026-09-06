import { Hono } from "hono";
import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "../../db/client.ts";
import { categories, menuItems } from "../../db/schema.ts";
import { categoryDeleteSchema, categoryWriteSchema, idParam, reorderSchema } from "../schemas.ts";
import { jsonError, HttpError } from "../lib/errors.ts";
import { newId, slugify } from "../lib/ids.ts";
import { bumpMenuRevision, NO_STORE } from "../lib/cache.ts";
import { categoryFlags } from "../lib/contentFlags.ts";
import { requireAuth, type AppEnv } from "../middleware/requireAuth.ts";

export const categoryRoutes = new Hono<AppEnv>();

categoryRoutes.get("/admin/categories", requireAuth, async (c) => {
  const { restaurantId } = c.get("auth");
  const db = getDb();
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.restaurantId, restaurantId))
    .orderBy(asc(categories.displayOrder));
  const itemCounts = await db
    .select({ categoryId: menuItems.categoryId, n: count() })
    .from(menuItems)
    .groupBy(menuItems.categoryId);
  const countMap = Object.fromEntries(itemCounts.map((row) => [row.categoryId, Number(row.n)]));
  c.header("Cache-Control", NO_STORE);
  return c.json(
    rows.map((row) => ({
      ...row,
      itemCount: countMap[row.id] ?? 0,
      flags: categoryFlags(row),
    })),
  );
});

categoryRoutes.get("/admin/categories/:id", requireAuth, async (c) => {
  try {
    const parsed = idParam.safeParse(c.req.param());
    if (!parsed.success) throw new HttpError(400, "invalid_id", "Invalid category.");
    const { restaurantId } = c.get("auth");
    const db = getDb();
    const [row] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, parsed.data.id), eq(categories.restaurantId, restaurantId)))
      .limit(1);
    if (!row) throw new HttpError(404, "not_found", "Category not found.");
    c.header("Cache-Control", NO_STORE);
    return c.json({ ...row, flags: categoryFlags(row) });
  } catch (error) {
    return jsonError(c, error);
  }
});

categoryRoutes.post("/categories", requireAuth, async (c) => {
  try {
    const parsed = categoryWriteSchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HttpError(400, "invalid_input", "Check the category fields.", flattenZod(parsed.error));
    const auth = c.get("auth");
    const db = getDb();
    const existing = await db
      .select({ displayOrder: categories.displayOrder, id: categories.id })
      .from(categories)
      .where(eq(categories.restaurantId, auth.restaurantId))
      .orderBy(asc(categories.displayOrder));
    const base = slugify(parsed.data.nameEn || parsed.data.nameAr);
    let id = parsed.data.id ?? base;
    if (existing.some((row) => row.id === id)) id = `${base}-${newId().slice(0, 6)}`;
    const displayOrder = parsed.data.displayOrder ?? existing.length + 1;
    const published = parsed.data.published ?? false;
    const [row] = await db
      .insert(categories)
      .values({
        id,
        restaurantId: auth.restaurantId,
        nameAr: parsed.data.nameAr,
        nameEn: parsed.data.nameEn,
        descriptionAr: parsed.data.descriptionAr ?? null,
        descriptionEn: parsed.data.descriptionEn ?? null,
        image: parsed.data.image ?? null,
        surface: parsed.data.surface ?? "cream",
        scriptAccent: parsed.data.scriptAccent ?? null,
        displayOrder,
        active: parsed.data.active ?? true,
        published,
        publishedAt: published ? new Date() : null,
        needsReview: parsed.data.needsReview ?? false,
        updatedBy: auth.userId,
      })
      .returning();
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ...row, flags: categoryFlags(row!) }, 201);
  } catch (error) {
    return jsonError(c, error);
  }
});

categoryRoutes.put("/categories/:id", requireAuth, async (c) => {
  try {
    const id = idParam.safeParse(c.req.param());
    if (!id.success) throw new HttpError(400, "invalid_id", "Invalid category.");
    const parsed = categoryWriteSchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HttpError(400, "invalid_input", "Check the category fields.", flattenZod(parsed.error));
    const auth = c.get("auth");
    const db = getDb();
    const [current] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id.data.id), eq(categories.restaurantId, auth.restaurantId)))
      .limit(1);
    if (!current) throw new HttpError(404, "not_found", "Category not found.");
    const published = parsed.data.published ?? current.published;
    const [row] = await db
      .update(categories)
      .set({
        nameAr: parsed.data.nameAr,
        nameEn: parsed.data.nameEn,
        descriptionAr: parsed.data.descriptionAr ?? null,
        descriptionEn: parsed.data.descriptionEn ?? null,
        image: parsed.data.image ?? current.image,
        surface: parsed.data.surface ?? current.surface,
        scriptAccent: parsed.data.scriptAccent ?? null,
        active: parsed.data.active ?? current.active,
        published,
        publishedAt: published ? (current.publishedAt ?? new Date()) : current.publishedAt,
        needsReview: parsed.data.needsReview ?? current.needsReview,
        updatedBy: auth.userId,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, current.id))
      .returning();
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ...row, flags: categoryFlags(row!) });
  } catch (error) {
    return jsonError(c, error);
  }
});

categoryRoutes.delete("/categories/:id", requireAuth, async (c) => {
  try {
    const id = idParam.safeParse(c.req.param());
    if (!id.success) throw new HttpError(400, "invalid_id", "Invalid category.");
    const query = categoryDeleteSchema.safeParse(c.req.query());
    let reassignTo = query.success ? query.data.reassignTo : undefined;
    try {
      const body = await c.req.json();
      const parsed = categoryDeleteSchema.safeParse(body);
      if (parsed.success) reassignTo = parsed.data.reassignTo ?? reassignTo;
    } catch {
      /* no body */
    }
    const auth = c.get("auth");
    const db = getDb();
    const [current] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id.data.id), eq(categories.restaurantId, auth.restaurantId)))
      .limit(1);
    if (!current) throw new HttpError(404, "not_found", "Category not found.");
    const attached = await db.select({ id: menuItems.id }).from(menuItems).where(eq(menuItems.categoryId, current.id));
    if (attached.length && !reassignTo) {
      throw new HttpError(
        409,
        "category_not_empty",
        "Move the dishes to another category before deleting this section.",
        { count: String(attached.length) },
      );
    }
    if (reassignTo) {
      if (reassignTo === current.id) {
        throw new HttpError(400, "invalid_input", "Choose a different category for the dishes.");
      }
      const [target] = await db
        .select()
        .from(categories)
        .where(and(eq(categories.id, reassignTo), eq(categories.restaurantId, auth.restaurantId)))
        .limit(1);
      if (!target) throw new HttpError(400, "invalid_input", "The destination category was not found.");
      await db.update(menuItems).set({ categoryId: target.id, updatedAt: new Date() }).where(eq(menuItems.categoryId, current.id));
    }
    await db.delete(categories).where(eq(categories.id, current.id));
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ok: true });
  } catch (error) {
    return jsonError(c, error);
  }
});

categoryRoutes.patch("/categories/reorder", requireAuth, async (c) => {
  try {
    const parsed = reorderSchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HttpError(400, "invalid_input", "Provide the category order.");
    const auth = c.get("auth");
    const db = getDb();
    const owned = await db.select({ id: categories.id }).from(categories).where(eq(categories.restaurantId, auth.restaurantId));
    const ownedIds = new Set(owned.map((row) => row.id));
    if (parsed.data.ids.some((id) => !ownedIds.has(id))) {
      throw new HttpError(403, "forbidden", "One or more categories do not belong to this restaurant.");
    }
    await Promise.all(
      parsed.data.ids.map((id, index) =>
        db
          .update(categories)
          .set({ displayOrder: index + 1, updatedAt: new Date(), updatedBy: auth.userId })
          .where(eq(categories.id, id)),
      ),
    );
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ok: true });
  } catch (error) {
    return jsonError(c, error);
  }
});

function flattenZod(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!details[key]) details[key] = issue.message;
  }
  return details;
}
