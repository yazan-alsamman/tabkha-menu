import type { Context, Next } from "hono";
import { HttpError, jsonError } from "../lib/errors.js";
import { readAuth, type AuthContext } from "../lib/session.js";

export type AppEnv = {
  Variables: {
    auth: AuthContext;
  };
};

export async function requireAuth(c: Context<AppEnv>, next: Next) {
  try {
    const auth = await readAuth(c);
    if (!auth) throw new HttpError(401, "unauthorized", "Please sign in to continue.");
    c.set("auth", auth);
    await next();
  } catch (error) {
    return jsonError(c, error);
  }
}
