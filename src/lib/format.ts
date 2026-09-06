import type { Locale } from "@/types/menu";

export function itemName(locale: Locale, nameAr: string, nameEn: string | null) {
  if (locale === "ar") return nameAr;
  return nameEn ?? nameAr;
}

export function formatPrice(price: number, locale: Locale) {
  const amount = Number.isInteger(price) ? String(price) : price.toFixed(2);
  return locale === "ar" ? `${amount} درهم` : `${amount} AED`;
}
