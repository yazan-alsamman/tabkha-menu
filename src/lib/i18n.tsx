import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { copy } from "@/data/copy";
import { isLocale, LOCALE_STORAGE_KEY } from "@/lib/locale";
import type { Locale } from "@/types/menu";

type I18nValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (typeof copy)[Locale];
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { locale: param } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locale: Locale = isLocale(param) ? param : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.title =
      locale === "ar"
        ? "طبخة آند مور | القائمة الرقمية"
        : "Tabkha and More | Digital Menu";
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [dir, locale]);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir,
      t: copy[locale],
      setLocale: (next) => {
        const suffix = location.search + location.hash;
        navigate(`/${next}${suffix}`, { replace: true });
      },
    }),
    [dir, locale, location.hash, location.search, navigate],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
