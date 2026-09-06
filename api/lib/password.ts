import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);
const KEYLEN = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, KEYLEN)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hex] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hex) return false;
  const key = (await scrypt(password, salt, KEYLEN)) as Buffer;
  const previous = Buffer.from(hex, "hex");
  if (previous.length !== key.length) return false;
  return timingSafeEqual(previous, key);
}

export function assertPasswordStrength(password: string) {
  if (password.length < 10) {
    return "Password must be at least 10 characters.";
  }
  return null;
}
