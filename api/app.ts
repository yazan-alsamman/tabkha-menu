import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { getMenuRevision, PUBLIC_CACHE } from "./lib/cache.ts";
import { loadPublicMenu, loadPublicSettings } from "./lib/loadMenu.ts";
import { jsonError } from "./lib/errors.ts";
import { authRoutes } from "./routes/auth.ts";
import { categoryRoutes } from "./routes/categories.ts";
import { itemRoutes } from "./routes/items.ts";
import { mediaRoutes } from "./routes/media.ts";
import { settingsRoutes } from "./routes/settings.ts";
import { adminRoutes } from "./routes/admin.ts";

const idParam = z.object({ id: z.string().min(1).max(80) });

export const app = new Hono().basePath("/api");

app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true,
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.onError((error, c) => jsonError(c, error));

app.get("/health", (c) => c.json({ ok: true }));

app.get("/menu", async (c) => {
  const payload = await loadPublicMenu();
  const restaurantId = payload.restaurant.id;
  let revision = "0";
  try {
    revision = await getMenuRevision(restaurantId);
  } catch {
    /* fallback snapshot still served */
  }
  const etag = `"rev-${revision}"`;
  c.header("Cache-Control", PUBLIC_CACHE);
  c.header("ETag", etag);
  if (c.req.header("If-None-Match") === etag) {
    return c.body(null, 304);
  }
  return c.json(payload);
});

app.get("/restaurant", async (c) => {
  const payload = await loadPublicMenu();
  c.header("Cache-Control", PUBLIC_CACHE);
  return c.json(payload.restaurant);
});

app.get("/categories", async (c) => {
  const payload = await loadPublicMenu();
  c.header("Cache-Control", PUBLIC_CACHE);
  return c.json(payload.categories.map(({ items: _items, ...category }) => category));
});

app.get("/menu-items", async (c) => {
  const payload = await loadPublicMenu();
  c.header("Cache-Control", PUBLIC_CACHE);
  return c.json(payload.categories.flatMap((category) => category.items));
});

app.get("/menu-items/:id", async (c) => {
  const parsed = idParam.safeParse(c.req.param());
  if (!parsed.success) return c.json({ error: "Invalid id", code: "invalid_id" }, 400);
  const payload = await loadPublicMenu();
  const item = payload.categories.flatMap((category) => category.items).find((row) => row.id === parsed.data.id);
  if (!item) return c.json({ error: "Not found", code: "not_found" }, 404);
  c.header("Cache-Control", PUBLIC_CACHE);
  return c.json(item);
});

app.get("/settings", async (c) => {
  const settings = await loadPublicSettings();
  c.header("Cache-Control", PUBLIC_CACHE);
  return c.json(settings);
});

app.route("/", authRoutes);
app.route("/", categoryRoutes);
app.route("/", itemRoutes);
app.route("/", mediaRoutes);
app.route("/", settingsRoutes);
app.route("/", adminRoutes);

export default app;
