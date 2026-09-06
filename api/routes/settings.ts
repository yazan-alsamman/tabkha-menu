import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { getDb } from "../../db/client.ts";
import { restaurants, settings } from "../../db/schema.ts";
import { settingsWriteSchema } from "../schemas.ts";
import { jsonError, HttpError } from "../lib/errors.ts";
import { bumpMenuRevision, NO_STORE } from "../lib/cache.ts";
import { requireAuth, type AppEnv } from "../middleware/requireAuth.ts";

export const settingsRoutes = new Hono<AppEnv>();

settingsRoutes.get("/admin/settings", requireAuth, async (c) => {
  const auth = c.get("auth");
  const db = getDb();
  const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, auth.restaurantId)).limit(1);
  if (!restaurant) return c.json({ error: "Restaurant not found.", code: "not_found" }, 404);
  const rows = await db.select().from(settings).where(eq(settings.restaurantId, auth.restaurantId));
  c.header("Cache-Control", NO_STORE);
  return c.json({
    restaurant,
    settings: Object.fromEntries(rows.map((row) => [row.key, row.value])),
  });
});

settingsRoutes.put("/admin/settings", requireAuth, async (c) => {
  try {
    const parsed = settingsWriteSchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HttpError(400, "invalid_input", "Check the restaurant fields.");
    const auth = c.get("auth");
    const db = getDb();
    const [current] = await db.select().from(restaurants).where(eq(restaurants.id, auth.restaurantId)).limit(1);
    if (!current) throw new HttpError(404, "not_found", "Restaurant not found.");
    const data = parsed.data;
    const [row] = await db
      .update(restaurants)
      .set({
        nameAr: data.nameAr ?? current.nameAr,
        nameEn: data.nameEn ?? current.nameEn,
        taglineAr: data.taglineAr ?? current.taglineAr,
        taglineEn: data.taglineEn ?? current.taglineEn,
        storyAr: data.storyAr ?? current.storyAr,
        storyEn: data.storyEn ?? current.storyEn,
        logo: data.logo ?? current.logo,
        currency: data.currency ?? current.currency,
        currencyLabelAr: data.currencyLabelAr ?? current.currencyLabelAr,
        defaultLocale: data.defaultLocale ?? current.defaultLocale,
        qrUrl: data.qrUrl === undefined ? current.qrUrl : data.qrUrl,
        phone: data.phone === undefined ? current.phone : data.phone,
        instagram: data.instagram === undefined ? current.instagram : data.instagram,
        addressAr: data.addressAr === undefined ? current.addressAr : data.addressAr,
        addressEn: data.addressEn === undefined ? current.addressEn : data.addressEn,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, current.id))
      .returning();
    if (data.defaultLocale) {
      const [existing] = await db
        .select()
        .from(settings)
        .where(and(eq(settings.restaurantId, auth.restaurantId), eq(settings.key, "default_locale")))
        .limit(1);
      if (existing) {
        await db.update(settings).set({ value: data.defaultLocale }).where(eq(settings.id, existing.id));
      } else {
        await db.insert(settings).values({
          id: `${auth.restaurantId}:default_locale`,
          restaurantId: auth.restaurantId,
          key: "default_locale",
          value: data.defaultLocale,
        });
      }
    }
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ restaurant: row });
  } catch (error) {
    return jsonError(c, error);
  }
});
