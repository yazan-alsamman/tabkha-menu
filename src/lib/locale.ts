import type { Locale } from "@/types/menu";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ar" || value === "en";
}

export function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem("tabkha-locale");
    if (isLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "ar";
}

export const LOCALE_STORAGE_KEY = "tabkha-locale";
