import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { itemName } from "@/lib/format";
import { Price } from "./Price";
import { PetalMark } from "@/components/branding/PetalMark";
import { CategoryPhoto } from "./CategoryPhoto";
import type { CategoryWithItems, MenuItemSeed } from "@/types/menu";

export function MenuItemSheet({
  item,
  category,
  onClose,
}: {
  item: MenuItemSeed | null;
  category: CategoryWithItems | null;
  onClose: () => void;
}) {
  const { locale, t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!item) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [item, onClose]);

  const overlay =
    item && category ? (
      <motion.div
        className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-forest/70 backdrop-blur-sm"
          aria-label={t.close}
          onClick={onClose}
        />
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="item-title"
          tabIndex={-1}
          drag={coarse ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.45 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 96 || info.velocity.y > 700) onClose();
          }}
          initial={{ y: 56, opacity: 0, scale: 0.98, rotateX: 8 }}
          animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ y: 40, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-h-[90dvh] w-full overflow-auto bg-cream text-forest outline-none sm:max-w-lg"
          style={{
            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
            transformPerspective: 900,
          }}
        >
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-forest/20 sm:hidden" />
          <div className="max-h-44 overflow-hidden sm:max-h-56">
            {item.image ? (
              <img src={item.image} alt="" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <CategoryPhoto slug={category.image} alt="" />
            )}
          </div>
          <div className="screen-gutter py-6">
            <PetalMark className="size-10 text-forest" />
            <p className="mt-6 text-[0.7rem] tracking-[0.28em] uppercase text-terracotta">
              {locale === "ar" ? category.nameAr : category.nameEn}
            </p>
            <h3 id="item-title" className="font-copy mt-2 text-[clamp(1.6rem,4vw,2.1rem)]">
              {itemName(locale, item.nameAr, item.nameEn)}
            </h3>
            {item.nameEn && item.nameAr ? (
              <p className="mt-2 text-forest/55">{locale === "ar" ? item.nameEn : item.nameAr}</p>
            ) : null}
            {(item.descriptionAr || item.descriptionEn) && (
              <p className="font-copy mt-6 leading-relaxed text-forest/80">
                {locale === "ar" ? item.descriptionAr : item.descriptionEn}
              </p>
            )}
            {item.portionNote ? <p className="mt-4 text-sm text-forest/50">{item.portionNote}</p> : null}
            <Price value={item.price} locale={locale} className="mt-8 block text-2xl text-terracotta" />
            <button
              type="button"
              onClick={onClose}
              className="mt-10 min-h-12 w-full border border-forest/20 py-3 text-sm tracking-[0.2em] uppercase"
            >
              {t.close}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null;

  if (typeof document === "undefined") return null;

  return createPortal(<AnimatePresence>{overlay}</AnimatePresence>, document.body);
}
