import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useMenu } from "@/hooks/useMenu";
import { useI18n } from "@/lib/i18n";
import { Hero } from "@/components/branding/Hero";
import { BrandStory } from "@/components/branding/BrandStory";
import { QRSection } from "@/components/branding/QRSection";
import { Footer } from "@/components/branding/Footer";
import { LoadingScreen } from "@/components/branding/LoadingScreen";
import { ScrollProgress } from "@/components/navigation/ScrollProgress";
import { PlatesBar } from "@/components/navigation/PlatesBar";
import { CategoryPicker } from "@/components/menu/CategoryPicker";
import { CategorySection } from "@/components/menu/CategorySection";
import { MenuItemSheet } from "@/components/menu/MenuItemSheet";
import type { CategoryWithItems, MenuItemSeed } from "@/types/menu";

const LANDING_KEY = "tabkha-seen-landing";

type Phase = "landing" | "categories" | "plates";

function readLandingSeen() {
  try {
    return sessionStorage.getItem(LANDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function MenuPage() {
  const { data, isPending } = useMenu();
  const { t } = useI18n();
  const payload = data?.data;
  const fromCache = data?.fromCache ?? false;
  const categories = useMemo(() => payload?.categories ?? [], [payload]);
  const [open, setOpen] = useState<{ item: MenuItemSeed; category: CategoryWithItems } | null>(null);
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [phase, setPhase] = useState<Phase>(() => (readLandingSeen() ? "categories" : "landing"));
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
    try {
      sessionStorage.setItem(LANDING_KEY, "1");
    } catch {
      /* ignore */
    }
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

  const skipTarget = phase === "landing" ? "#categories" : "#menu";

  return (
    <div id="top">
      <a
        href={skipTarget}
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
      {phase !== "landing" ? <ScrollProgress /> : null}

      {phase === "landing" ? (
        <Hero onContinue={enterMenu} active={!isPending || booted} />
      ) : null}

      {phase === "categories" && payload ? (
        <>
          {offline || fromCache ? (
            <p className="bg-terracotta/20 px-5 py-3 text-center text-sm text-cream">{offline ? t.offline : t.loadError}</p>
          ) : null}
          <CategoryPicker categories={categories} onSelect={openCategory} />
          <BrandStory restaurant={payload.restaurant} />
          <QRSection />
          <Footer />
        </>
      ) : null}

      {phase === "plates" && selected ? (
        <>
          <div id="menu">
            <PlatesBar category={selected} onBack={backToCategories} />
          </div>
          <CategorySection category={selected} onOpen={(item) => setOpen({ item, category: selected })} />
          <Footer />
          <MenuItemSheet item={open?.item ?? null} category={open?.category ?? null} onClose={() => setOpen(null)} />
        </>
      ) : null}

      {phase !== "landing" && !payload && !isPending ? (
        <p className="bg-cream px-5 py-20 text-center text-forest">{t.noCategories}</p>
      ) : null}
    </div>
  );
}
