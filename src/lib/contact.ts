export const INSTAGRAM_URL = "https://www.instagram.com/tabkha_n_more/";
export const INSTAGRAM_HANDLE = "tabkha_n_more";

export const PHONE_E164 = "+971527791340";
export const PHONE_DISPLAY = "+971 52 779 1340";

export const ADDRESS_EN = "Dubai, Jumeirah 16C Street";
export const ADDRESS_AR = "دبي، الجميرا، شارع 16C";
export const MAPS_URL = "https://maps.google.com/?q=Jumeirah+16C+Street+Dubai";

export const VEGACORE_NAME = "Vega Core";

/** Table QR codes must open the public Arabic menu, never /admin. */
export function publicMenuUrl(locale: "ar" | "en" = "ar") {
  const origin = (import.meta.env.VITE_PUBLIC_URL || "https://tabkha-menu.vercel.app").replace(/\/$/, "");
  return `${origin}/${locale}`;
}
