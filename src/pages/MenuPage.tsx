import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useMenu } from "@/hooks/useMenu";
import { useActiveCategory } from "@/hooks/useActiveCategory";
import { useI18n } from "@/lib/i18n";
import { Hero } from "@/components/branding/Hero";
import { BrandStory } from "@/components/branding/BrandStory";
import { QRSection } from "@/components/branding/QRSection";
import { Footer } from "@/components/branding/Footer";
import { LoadingScreen } from "@/components/branding/LoadingScreen";
import { CategoryNav } from "@/components/navigation/CategoryNav";
import { ScrollProgress } from "@/components/navigation/ScrollProgress";
import { CategorySection } from "@/components/menu/CategorySection";
import { MenuItemSheet } from "@/components/menu/MenuItemSheet";
import type { CategoryWithItems, MenuItemSeed } from "@/types/menu";

export function MenuPage() {
  const { data, isPending } = useMenu();
  const { t } = useI18n();
  const payload = data?.data;
  const fromCache = data?.fromCache ?? false;
  const categories = useMemo(() => payload?.categories ?? [], [payload]);
  const ids = useMemo(() => categories.map((category) => category.id), [categories]);
  const activeId = useActiveCategory(ids);
  const [open, setOpen] = useState<{ item: MenuItemSeed; category: CategoryWithItems } | null>(null);
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);

  const [booted, setBooted] = useState(() => {
    try {
      return sessionStorage.getItem("tabkha-booted") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isPending) {
      try {
        sessionStorage.setItem("tabkha-booted", "1");
      } catch {
        /* ignore */
      }
      setBooted(true);
    }
  }, [isPending]);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div id="top">
      <a href="#menu" className="skip-link">
        {t.skipToMenu}
      </a>
      {fromCache === false && data?.preview ? (
        <p className="sticky top-0 z-[45] bg-terracotta px-4 py-2 text-center text-[0.7rem] tracking-[0.18em] uppercase text-cream">
          {t.draftPreview}
        </p>
      ) : null}
      <AnimatePresence>{isPending && !booted ? <LoadingScreen visible /> : null}</AnimatePresence>
      <ScrollProgress />
      <Hero />
      {payload ? (
        <>
          <div id="menu">
            <CategoryNav categories={categories} activeId={activeId} />
          </div>
          {offline || fromCache ? (
            <p className="bg-terracotta/20 px-5 py-3 text-center text-sm text-cream">
              {offline ? t.offline : t.loadError}
            </p>
          ) : null}
          {categories.length ? (
            categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                onOpen={(item) => setOpen({ item, category })}
              />
            ))
          ) : (
            <p className="bg-cream px-5 py-20 text-center text-forest">{t.noCategories}</p>
          )}
          <BrandStory restaurant={payload.restaurant} />
          <QRSection />
          <Footer />
          <MenuItemSheet
            item={open?.item ?? null}
            category={open?.category ?? null}
            onClose={() => setOpen(null)}
          />
        </>
      ) : null}
    </div>
  );
}
