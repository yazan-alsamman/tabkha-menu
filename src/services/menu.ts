import type { MenuPayload } from "@/types/menu";
import { buildMenuPayload } from "@/data/menu.seed";

const fallback = buildMenuPayload();

export async function fetchMenu(opts?: { preview?: boolean }): Promise<{
  data: MenuPayload;
  fromCache: boolean;
  preview: boolean;
}> {
  const preview = Boolean(opts?.preview);
  try {
    const response = await fetch(preview ? "/api/preview/menu" : "/api/menu", {
      headers: { accept: "application/json" },
      credentials: preview ? "include" : "same-origin",
    });
    if (!response.ok) throw new Error("bad status");
    const data = (await response.json()) as MenuPayload;
    if (!data?.categories?.length) throw new Error("empty");
    return { data, fromCache: false, preview };
  } catch {
    return { data: fallback, fromCache: true, preview };
  }
}
