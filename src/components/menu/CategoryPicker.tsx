import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { categoryImage } from "@/lib/images";
import { PetalMark } from "@/components/branding/PetalMark";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import type { CategoryWithItems } from "@/types/menu";

export function CategoryPicker({
  categories,
  onSelect,
}: {
  categories: CategoryWithItems[];
  onSelect: (id: string) => void;
}) {
  const { locale, t } = useI18n();

  return (
    <div id="categories" className="min-h-dvh bg-cream text-forest">
      <header
        className="sticky top-0 z-rail border-b border-cream/10 bg-forest text-cream"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-3 py-3 screen-gutter">
          <PetalMark className="size-8 shrink-0 text-cream" title="Tabkha" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.62rem] tracking-[0.28em] uppercase text-terracotta">{t.menu}</p>
            <h1 className="font-copy truncate text-lg leading-tight">{t.chooseCategory}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {categories.length ? (
        <div className="mx-auto grid max-w-[90rem] grid-cols-2 gap-3 py-5 screen-gutter sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, index) => {
            const image = categoryImage(category.image);
            const primary = locale === "ar" ? category.nameAr : category.nameEn;
            const secondary = locale === "ar" ? category.nameEn : category.nameAr;
            return (
              <motion.button
                key={category.id}
                type="button"
                onClick={() => onSelect(category.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden bg-cream-warm text-start ring-1 ring-forest/10"
              >
                {image.src ? (
                  <img
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                    loading={index < 6 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center bg-forest/8">
                    <PetalMark className="size-10 text-forest/25" />
                  </div>
                )}
                <span className="font-copy block px-2.5 pt-2.5 text-[0.98rem] leading-snug">{primary}</span>
                <span className="block px-2.5 pb-3 text-[0.7rem] text-forest/50">{secondary}</span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-20 text-center">{t.noCategories}</p>
      )}
    </div>
  );
}
