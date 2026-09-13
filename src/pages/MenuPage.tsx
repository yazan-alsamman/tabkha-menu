import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useMenu } from "@/hooks/useMenu";
import { useI18n } from "@/lib/i18n";
import { Hero } from "@/components/branding/Hero";
import { BrandStory } from "@/components/branding/BrandStory";
import { Footer } from "@/components/branding/Footer";
import { LoadingScreen } from "@/components/branding/LoadingScreen";
import { GuestBar, GuestChrome } from "@/components/navigation/GuestBar";
import { CategoryPicker } from "@/components/menu/CategoryPicker";
import { CategorySection } from "@/components/menu/CategorySection";
import { MenuItemSheet } from "@/components/menu/MenuItemSheet";
import type { CategoryWithItems, MenuItemSeed } from "@/types/menu";

type Phase = "landing" | "categories" | "plates";

export function MenuPage() {
  const { data, isPending } = useMenu();
  const { t, locale } = useI18n();
  const payload = data?.data;
  const fromCache = data?.fromCache ?? false;
  const categories = useMemo(() => payload?.categories ?? [], [payload]);
  const [open, setOpen] = useState<{ item: MenuItemSeed; category: CategoryWithItems } | null>(null);
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [phase, setPhase] = useState<Phase>("landing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = categories.find((category) => category.id === selectedId) ?? null;

  const [booted, setBooted] = useState(() => {
    try {
      return sessionStorage.getItem("tabkha-booted") === "1";
    } catch {
      return false;
    }
  });

  const enterMenu = useCallback(() => {
    setPhase("categories");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const openCategory = useCallback((id: string) => {
    setSelectedId(id);
    setPhase("plates");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const backToCategories = useCallback(() => {
    setSelectedId(null);
    setOpen(null);
    setPhase("categories");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const backToLanding = useCallback(() => {
    setSelectedId(null);
    setOpen(null);
    setPhase("landing");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

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

  useEffect(() => {
    document.body.style.overflow = phase === "landing" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  const inMenu = phase !== "landing";
  const barTitle =
    phase === "plates" && selected
      ? locale === "ar"
        ? selected.nameAr
        : selected.nameEn
      : t.chooseCategory;
  const barEyebrow = phase === "plates" ? t.categories : t.menu;

  return (
    <div id="top">
      <a
        href={inMenu ? "#menu" : "#categories"}
        className="skip-link"
        onClick={(event) => {
          if (phase !== "landing") return;
          event.preventDefault();
          enterMenu();
        }}
      >
        {t.skipToMenu}
      </a>
      {fromCache === false && data?.preview ? (
        <p className="sticky top-0 z-[45] bg-terracotta px-4 py-2 text-center text-[0.7rem] tracking-[0.18em] uppercase text-cream">
          {t.draftPreview}
        </p>
      ) : null}
      <AnimatePresence>{isPending && !booted ? <LoadingScreen visible /> : null}</AnimatePresence>

      {inMenu ? (
        <GuestChrome>
          <GuestBar
            eyebrow={barEyebrow}
            title={barTitle}
            onBack={phase === "plates" ? backToCategories : backToLanding}
          />
        </GuestChrome>
      ) : null}

      {phase === "landing" ? <Hero onContinue={enterMenu} /> : null}

      {phase === "categories" && payload ? (
        <div className="guest-page">
          {offline || fromCache ? (
            <p className="bg-terracotta px-5 py-2.5 text-center text-sm text-cream">{offline ? t.offline : t.loadError}</p>
          ) : null}
          <CategoryPicker categories={categories} onSelect={openCategory} />
          <BrandStory restaurant={payload.restaurant} />
          <Footer />
        </div>
      ) : null}

      {phase === "plates" && selected ? (
        <div className="guest-page">
          <div id="menu">
            <CategorySection category={selected} onOpen={(item) => setOpen({ item, category: selected })} />
          </div>
          <Footer />
          <MenuItemSheet item={open?.item ?? null} category={open?.category ?? null} onClose={() => setOpen(null)} />
        </div>
      ) : null}

      {phase !== "landing" && !payload && !isPending ? (
        <p className="guest-page bg-cream px-5 py-20 text-center text-forest">{t.noCategories}</p>
      ) : null}
    </div>
  );
}
