import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isSafeStorageKey } from "./ids.ts";

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "uploads");

export async function putObject(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!isSafeStorageKey(key)) {
    throw new Error("Invalid storage key");
  }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, body, { access: "public", contentType, token, addRandomSuffix: false });
    return blob.url;
  }
  const full = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body);
  return `/api/media/file/${key}`;
}

export async function deleteObject(key: string) {
  if (!isSafeStorageKey(key)) return;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const { del } = await import("@vercel/blob");
    await del(key, { token });
    return;
  }
  const full = path.resolve(path.join(UPLOAD_DIR, key));
  if (!full.startsWith(UPLOAD_DIR)) return;
  try {
    await unlink(full);
  } catch {
    /* already gone */
  }
}

export async function readLocalObject(key: string) {
  if (!isSafeStorageKey(key)) return null;
  const full = path.resolve(path.join(UPLOAD_DIR, key));
  if (!full.startsWith(UPLOAD_DIR)) return null;
  try {
    return await readFile(full);
  } catch {
    return null;
  }
}
