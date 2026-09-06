import { createHash, randomBytes } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../../db/client.ts";
import { restaurantUsers, sessions, users } from "../../db/schema.ts";

export const SESSION_COOKIE = "tabkha_session";
const SESSION_DAYS = 7;

export type AuthContext = {
  userId: string;
  email: string;
  name: string;
  restaurantId: string;
  role: string;
};

function cookieSecure() {
  return process.env.NODE_ENV === "production";
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = getDb();
  await db.insert(sessions).values({ id, userId, expiresAt });
  return { token, expiresAt };
}

export function writeSessionCookie(c: Context, token: string, expiresAt: Date) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: cookieSecure(),
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

export async function readAuth(c: Context): Promise<AuthContext | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const db = getDb();
  const [session] = await db.select().from(sessions).where(eq(sessions.id, hashToken(token))).limit(1);
  if (!session || session.expiresAt.getTime() < Date.now()) {
    if (session) await db.delete(sessions).where(eq(sessions.id, session.id));
    return null;
  }
  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user || !user.active) return null;
  const [membership] = await db
    .select()
    .from(restaurantUsers)
    .where(eq(restaurantUsers.userId, user.id))
    .limit(1);
  if (!membership) return null;
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    restaurantId: membership.restaurantId,
    role: membership.role,
  };
}

export async function destroySession(c: Context) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    await getDb().delete(sessions).where(eq(sessions.id, hashToken(token)));
  }
  clearSessionCookie(c);
}
