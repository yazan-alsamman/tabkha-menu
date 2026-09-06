import { randomBytes } from "node:crypto";

export function newId(prefix = "") {
  const body = randomBytes(9).toString("base64url");
  return prefix ? `${prefix}_${body}` : body;
}

export function slugify(input: string) {
  const latin = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return latin || `c-${newId().slice(0, 8)}`;
}

export function isSafeStorageKey(key: string) {
  return /^[a-zA-Z0-9/_.:-]+$/.test(key) && !key.includes("..");
}
