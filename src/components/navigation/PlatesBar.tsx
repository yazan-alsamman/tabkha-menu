import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { CategoryWithItems } from "@/types/menu";

export function PlatesBar({
  category,
  onBack,
}: {
  category: CategoryWithItems;
  onBack: () => void;
}) {
  const { locale, t } = useI18n();
  const title = locale === "ar" ? category.nameAr : category.nameEn;

  return (
    <div
      className="sticky top-0 z-rail border-b border-cream/10 bg-forest/97 text-cream backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center gap-2 py-2 screen-gutter">
        <button type="button" onClick={onBack} className="min-h-11 shrink-0 px-1 text-sm text-cream/80">
          {t.back}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] tracking-[0.28em] uppercase text-terracotta">{t.categories}</p>
          <p className="font-copy truncate text-[1.05rem] leading-tight">{title}</p>
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
