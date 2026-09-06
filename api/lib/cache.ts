import { eq } from "drizzle-orm";
import { getDb } from "../../db/client.ts";
import { settings } from "../../db/schema.ts";

const KEY = "menu_revision";

export const PUBLIC_CACHE = "public, s-maxage=15, stale-while-revalidate=60";
export const NO_STORE = "private, no-store";

export async function getMenuRevision(restaurantId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, `${restaurantId}:${KEY}`))
    .limit(1);
  return row?.value ?? "0";
}

export async function bumpMenuRevision(restaurantId: string) {
  const db = getDb();
  const current = Number(await getMenuRevision(restaurantId)) || 0;
  const next = String(current + 1);
  const id = `${restaurantId}:${KEY}`;
  await db
    .insert(settings)
    .values({ id, restaurantId, key: KEY, value: next })
    .onConflictDoUpdate({
      target: settings.id,
      set: { value: next },
    });
  return next;
}
