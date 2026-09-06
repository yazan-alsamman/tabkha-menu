import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className="flex shrink-0 items-center rounded-full bg-cream/10 p-0.5 text-[0.68rem] tracking-[0.12em]"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={`min-h-10 rounded-full px-2.5 ${locale === "ar" ? "bg-cream text-forest" : "text-cream/70"}`}
        onClick={() => setLocale("ar")}
        aria-label="العربية"
        aria-pressed={locale === "ar"}
      >
        ع
      </button>
      <button
        type="button"
        className={`min-h-10 rounded-full px-2.5 ${locale === "en" ? "bg-cream text-forest" : "text-cream/70"}`}
        onClick={() => setLocale("en")}
        aria-label="English"
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
