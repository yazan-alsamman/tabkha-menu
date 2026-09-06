import type { MenuPayload } from "@/types/menu";
import type { AdminCategory, AdminItem, AdminSettings, AdminUser, MediaRecord, Overview } from "./types";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string>;

  constructor(status: number, code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: "include",
      ...init,
      headers: isForm
        ? init.headers
        : { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
  } catch {
    throw new ApiError(0, "network", "Could not reach the server. Check the connection.");
  }
  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
    details?: Record<string, string>;
  };
  if (!response.ok) {
    throw new ApiError(response.status, data.code ?? "error", data.error ?? "Request failed", data.details);
  }
  return data as T;
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ user: AdminUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: AdminUser }>("/api/auth/me"),
  overview: () => request<Overview>("/api/admin/overview"),
  categories: () => request<AdminCategory[]>("/api/admin/categories"),
  category: (id: string) => request<AdminCategory>(`/api/admin/categories/${id}`),
  createCategory: (body: Record<string, unknown>) =>
    request<AdminCategory>("/api/categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (id: string, body: Record<string, unknown>) =>
    request<AdminCategory>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCategory: (id: string, reassignTo?: string) =>
    request<{ ok: boolean }>(`/api/categories/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ reassignTo }),
    }),
  reorderCategories: (ids: string[]) =>
    request<{ ok: boolean }>("/api/categories/reorder", { method: "PATCH", body: JSON.stringify({ ids }) }),
  items: (query = "") => request<AdminItem[]>(`/api/admin/menu-items${query}`),
  item: (id: string) => request<AdminItem>(`/api/admin/menu-items/${id}`),
  createItem: (body: Record<string, unknown>) =>
    request<AdminItem>("/api/menu-items", { method: "POST", body: JSON.stringify(body) }),
  updateItem: (id: string, body: Record<string, unknown>) =>
    request<AdminItem>(`/api/menu-items/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteItem: (id: string) => request<{ ok: boolean }>(`/api/menu-items/${id}`, { method: "DELETE" }),
  duplicateItem: (id: string) =>
    request<AdminItem>(`/api/menu-items/${id}/duplicate`, { method: "POST" }),
  setAvailability: (id: string, available: boolean) =>
    request<AdminItem>(`/api/menu-items/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ available }),
    }),
  reorderItems: (ids: string[]) =>
    request<{ ok: boolean }>("/api/menu-items/reorder", { method: "PATCH", body: JSON.stringify({ ids }) }),
  bulkItems: (body: { ids: string[]; action: "show" | "hide" | "delete" | "category"; categoryId?: string }) =>
    request<{ ok: boolean }>("/api/menu-items/bulk", { method: "POST", body: JSON.stringify(body) }),
  settings: () => request<AdminSettings>("/api/admin/settings"),
  saveSettings: (body: Record<string, unknown>) =>
    request<AdminSettings>("/api/admin/settings", { method: "PUT", body: JSON.stringify(body) }),
  previewMenu: () => request<MenuPayload>("/api/preview/menu"),
  upload: async (file: File, kind: "dish" | "category" | "logo") => {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    return request<MediaRecord>("/api/media", { method: "POST", body: form });
  },
};
