import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { adminCopy, type AdminCopy, type AdminLocale } from "./copy";

const KEY = "tabkha-admin-locale";

type Value = {
  locale: AdminLocale;
  dir: "rtl" | "ltr";
  t: AdminCopy;
  setLocale: (locale: AdminLocale) => void;
};

const Ctx = createContext<Value | null>(null);

function readLocale(): AdminLocale {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "en" || stored === "ar") return stored;
  } catch {
    /* ignore */
  }
  return "ar";
}

export function AdminI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>(readLocale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.title = locale === "ar" ? "طبخة آند مور | إدارة القائمة" : "Tabkha and More | Menu studio";
    try {
      localStorage.setItem(KEY, locale);
    } catch {
      /* ignore */
    }
  }, [dir, locale]);

  const value = useMemo<Value>(
    () => ({
      locale,
      dir,
      t: adminCopy[locale],
      setLocale: (next) => setLocaleState(next),
    }),
    [dir, locale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminI18n must be used within AdminI18nProvider");
  return ctx;
}
