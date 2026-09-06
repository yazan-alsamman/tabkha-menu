import { PetalMark } from "./PetalMark";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { locale, t } = useI18n();
  return (
    <footer className="bg-forest-deep py-[clamp(3rem,8vh,5rem)] text-center text-cream screen-gutter">
      <PetalMark className="mx-auto size-10 text-cream/80" />
      <p className="font-copy mt-6 text-xl">{t.thankYou}</p>
      <p className="mt-3 text-sm tracking-[0.2em] uppercase text-sage">
        {locale === "ar" ? "طبخة آند مور" : "Tabkha and More"}
      </p>
    </footer>
  );
}
