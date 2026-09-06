import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { itemName } from "@/lib/format";
import { Price } from "./Price";
import type { MenuItemSeed, Surface } from "@/types/menu";
import type { PointerEvent } from "react";

export function MenuItemCard({
  item,
  surface,
  index,
  onOpen,
}: {
  item: MenuItemSeed;
  surface: Surface;
  index: number;
  onOpen: () => void;
}) {
  const { locale, t } = useI18n();
  const reduce = useReducedMotion();
  const primary = itemName(locale, item.nameAr, item.nameEn);
  const secondary = locale === "ar" ? item.nameEn : item.nameEn ? item.nameAr : null;
  const muted = surface === "forest" ? "text-cream/55" : "text-forest/50";
  const ink = surface === "forest" ? "text-cream" : "text-forest";
  const line = surface === "forest" ? "border-cream/12" : "border-forest/12";
  const photo = item.image;

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 20 });

  const onPointer = (event: PointerEvent<HTMLButtonElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onPointerMove={onPointer}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformPerspective: 800 }}
      whileTap={{ scale: 0.98 }}
      className={`group grid min-h-12 w-full items-baseline gap-x-4 gap-y-1 border-b ${line} py-4 text-start will-change-transform ${
        photo ? "grid-cols-[3.25rem_1fr_auto]" : "grid-cols-[1fr_auto]"
      }`}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          className="col-start-1 row-span-3 mt-1 aspect-square w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <span className={`font-copy text-[clamp(1rem,1.4vw,1.2rem)] leading-snug ${ink}`}>{primary}</span>
      <Price
        value={item.price}
        locale={locale}
        className="text-terracotta transition-transform duration-300 group-hover:-translate-y-0.5"
      />
      {secondary ? (
        <span className={`text-sm ${muted}`}>{secondary}</span>
      ) : locale === "en" && !item.nameEn ? (
        <span className={`text-xs ${muted}`}>{t.suggestedEn}</span>
      ) : null}
      {item.descriptionAr || item.descriptionEn ? (
        <span className={`${photo ? "col-span-2 col-start-2" : "col-span-2"} text-sm ${muted}`}>
          {locale === "ar" ? item.descriptionAr : item.descriptionEn}
        </span>
      ) : null}
      {item.portionNote ? (
        <span className={`${photo ? "col-span-2 col-start-2" : "col-span-2"} text-xs ${muted}`}>
          {item.portionNote}
        </span>
      ) : null}
    </motion.button>
  );
}
