import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { categoryImage } from "@/lib/images";
import { PetalMark } from "@/components/branding/PetalMark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { CategoryWithItems } from "@/types/menu";

export function CategoryNav({
  categories,
  activeId,
}: {
  categories: CategoryWithItems[];
  activeId: string;
}) {
  const { locale, t } = useI18n();
  const [picker, setPicker] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const active = categories.find((category) => category.id === activeId) ?? categories[0];
  const label = active ? (locale === "ar" ? active.nameAr : active.nameEn) : t.menu;

  useEffect(() => {
    const container = scroller.current;
    const chip = container?.querySelector<HTMLElement>(`[data-chip="${activeId}"]`);
    if (!container || !chip) return;
    const rail = container.getBoundingClientRect();
    const target = chip.getBoundingClientRect();
    container.scrollBy({
      left: target.left + target.width / 2 - (rail.left + rail.width / 2),
      behavior: "auto",
    });
  }, [activeId]);

  useEffect(() => {
    if (!picker) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPicker(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [picker]);

  const jump = (id: string) => {
    setPicker(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div
        className="sticky top-0 z-rail border-b border-cream/10 bg-forest/97 text-cream backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-2 py-2 screen-gutter">
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center"
            aria-label="Tabkha"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <PetalMark className="size-7" />
          </button>
          <button
            type="button"
            onClick={() => setPicker(true)}
            className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-sm bg-cream/8 px-3 text-start"
            aria-haspopup="dialog"
            aria-expanded={picker}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[0.62rem] tracking-[0.28em] uppercase text-terracotta">
                {t.categories}
              </span>
              <span className="font-copy mt-0.5 block truncate text-[1.05rem] leading-tight">{label}</span>
            </span>
            <span className="text-cream/70" aria-hidden>
              {picker ? "–" : "+"}
            </span>
          </button>
          <LanguageSwitcher />
        </div>
        <div
          ref={scroller}
          className="flex gap-2 overflow-x-auto overscroll-x-contain px-[max(1rem,env(safe-area-inset-left))] pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={t.categories}
        >
          {categories.map((category) => {
            const selected = category.id === activeId;
            const name = locale === "ar" ? category.nameAr : category.nameEn;
            return (
              <button
                key={category.id}
                type="button"
                data-chip={category.id}
                role="tab"
                aria-selected={selected}
                onClick={() => jump(category.id)}
                className={`shrink-0 snap-center rounded-full px-3.5 py-2 text-[0.78rem] whitespace-nowrap transition-colors ${
                  selected ? "bg-terracotta text-cream" : "bg-cream/8 text-cream/70"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {picker ? (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-forest/75 backdrop-blur-sm"
              aria-label={t.close}
              onClick={() => setPicker(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-picker-title"
              initial={{ y: 48 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[86dvh] w-full overflow-auto bg-cream text-forest"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-forest/20" />
              <div className="flex items-end justify-between gap-4 px-5 pt-5 pb-4">
                <div>
                  <p className="text-[0.65rem] tracking-[0.3em] uppercase text-terracotta">{t.menu}</p>
                  <h2 id="category-picker-title" className="font-copy mt-1 text-2xl">
                    {t.categories}
                  </h2>
                </div>
                <button type="button" onClick={() => setPicker(false)} className="min-h-11 px-2 text-sm">
                  {t.close}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 px-3 sm:grid-cols-3">
                {categories.map((category) => {
                  const image = categoryImage(category.image);
                  const selected = category.id === activeId;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => jump(category.id)}
                      className={`overflow-hidden text-start ${selected ? "ring-2 ring-terracotta" : "ring-1 ring-forest/10"}`}
                    >
                      {image.src ? (
                        <img
                          src={image.src}
                          alt=""
                          className="pointer-events-none aspect-[4/3] w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <span className="font-copy block px-2.5 pt-2 text-[0.95rem] leading-snug">
                        {locale === "ar" ? category.nameAr : category.nameEn}
                      </span>
                      <span className="block px-2.5 pb-2.5 text-[0.7rem] text-forest/50">
                        {locale === "ar" ? category.nameEn : category.nameAr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
