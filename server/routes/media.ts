import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { getDb } from "../../db/client.js";
import { media } from "../../db/schema.js";
import { jsonError, HttpError } from "../lib/errors.js";
import { newId } from "../lib/ids.js";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, optimizeImage, sniffMime } from "../lib/images.js";
import { deleteObject, putObject, readLocalObject } from "../lib/storage.js";
import { bumpMenuRevision, NO_STORE } from "../lib/cache.js";
import { requireAuth, type AppEnv } from "../middleware/requireAuth.js";
import { idParam } from "../schemas.js";

const KIND = new Set(["dish", "category", "logo"]);

export const mediaRoutes = new Hono<AppEnv>();

mediaRoutes.get("/media/file/*", async (c) => {
  const key = c.req.path.replace(/^\/api\/media\/file\//, "");
  const file = await readLocalObject(key);
  if (!file) return c.json({ error: "File not found.", code: "not_found" }, 404);
  c.header("Cache-Control", "public, max-age=31536000, immutable");
  c.header("Content-Type", "image/webp");
  return c.body(new Uint8Array(file));
});

mediaRoutes.post("/media", requireAuth, async (c) => {
  try {
    const auth = c.get("auth");
    const body = await c.req.parseBody({ all: true });
    const file = body.file;
    if (!(file instanceof File)) {
      throw new HttpError(400, "invalid_input", "Choose an image to upload.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new HttpError(400, "file_too_large", "Images must be 6 MB or smaller.");
    }
    const declared = file.type || undefined;
    if (declared && !ALLOWED_MIME.has(declared)) {
      throw new HttpError(400, "invalid_type", "Use JPEG, PNG, WebP, or AVIF.");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = sniffMime(buffer, declared);
    if (!mime || !ALLOWED_MIME.has(mime)) {
      throw new HttpError(400, "invalid_type", "That file is not a supported image.");
    }
    const kind = String(body.kind ?? "dish");
    if (!KIND.has(kind)) throw new HttpError(400, "invalid_input", "Unknown image kind.");
    const optimized = await optimizeImage(buffer);
    const id = newId("media");
    const variants: Record<string, string> = {};
    let mainUrl = "";
    let mainKey = "";
    for (const variant of optimized.variants) {
      const key = `${auth.restaurantId}/${kind}/${id}/${variant.width}.webp`;
      const url = await putObject(key, variant.buffer, "image/webp");
      variants[String(variant.width)] = url;
      if (variant.width === 900 || !mainUrl) {
        mainUrl = url;
        mainKey = key;
      }
    }
    const db = getDb();
    const [row] = await db
      .insert(media)
      .values({
        id,
        restaurantId: auth.restaurantId,
        kind,
        storageKey: mainKey,
        url: mainUrl,
        mime: "image/webp",
        width: optimized.width,
        height: optimized.height,
        sizeBytes: optimized.variants.reduce((sum, item) => sum + item.buffer.length, 0),
        altAr: String(body.altAr ?? "") || null,
        altEn: String(body.altEn ?? "") || null,
        variants,
        createdBy: auth.userId,
      })
      .returning();
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json(row, 201);
  } catch (error) {
    return jsonError(c, error);
  }
});

mediaRoutes.delete("/media/:id", requireAuth, async (c) => {
  try {
    const parsed = idParam.safeParse(c.req.param());
    if (!parsed.success) throw new HttpError(400, "invalid_id", "Invalid image.");
    const auth = c.get("auth");
    const db = getDb();
    const [row] = await db
      .select()
      .from(media)
      .where(and(eq(media.id, parsed.data.id), eq(media.restaurantId, auth.restaurantId)))
      .limit(1);
    if (!row) throw new HttpError(404, "not_found", "Image not found.");
    const keys = new Set<string>([row.storageKey]);
    if (row.variants && typeof row.variants === "object") {
      for (const url of Object.values(row.variants)) {
        const key = keyFromUrl(url);
        if (key) keys.add(key);
      }
    }
    await Promise.all([...keys].map((key) => deleteObject(key)));
    await db.delete(media).where(eq(media.id, row.id));
    await bumpMenuRevision(auth.restaurantId);
    c.header("Cache-Control", NO_STORE);
    return c.json({ ok: true });
  } catch (error) {
    return jsonError(c, error);
  }
});

function keyFromUrl(url: string) {
  const marker = "/api/media/file/";
  const index = url.indexOf(marker);
  if (index >= 0) return url.slice(index + marker.length);
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}
