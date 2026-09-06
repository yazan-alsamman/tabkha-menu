import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../../db/client.js";
import { restaurantUsers, users } from "../../db/schema.js";
import { loginSchema } from "../schemas.js";
import { jsonError, HttpError } from "../lib/errors.js";
import { verifyPassword } from "../lib/password.js";
import { createSession, destroySession, readAuth, writeSessionCookie } from "../lib/session.js";
import { NO_STORE } from "../lib/cache.js";

export const authRoutes = new Hono();

authRoutes.post("/auth/login", async (c) => {
  try {
    const parsed = loginSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      throw new HttpError(400, "invalid_input", "Enter a valid email and password.");
    }
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
    if (!user || !user.active) {
      throw new HttpError(401, "invalid_credentials", "Email or password is incorrect.");
    }
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, "invalid_credentials", "Email or password is incorrect.");
    }
    const [membership] = await db.select().from(restaurantUsers).where(eq(restaurantUsers.userId, user.id)).limit(1);
    if (!membership) {
      throw new HttpError(403, "forbidden", "This account is not linked to a restaurant.");
    }
    const session = await createSession(user.id);
    writeSessionCookie(c, session.token, session.expiresAt);
    c.header("Cache-Control", NO_STORE);
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        restaurantId: membership.restaurantId,
        role: membership.role,
      },
    });
  } catch (error) {
    return jsonError(c, error);
  }
});

authRoutes.post("/auth/logout", async (c) => {
  await destroySession(c);
  c.header("Cache-Control", NO_STORE);
  return c.json({ ok: true });
});

authRoutes.get("/auth/me", async (c) => {
  c.header("Cache-Control", NO_STORE);
  const auth = await readAuth(c);
  if (!auth) return c.json({ error: "Please sign in to continue.", code: "unauthorized" }, 401);
  return c.json({
    user: {
      id: auth.userId,
      email: auth.email,
      name: auth.name,
      restaurantId: auth.restaurantId,
      role: auth.role,
    },
  });
});
