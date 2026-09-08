import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { WordmarkAr, WordmarkLatin } from "./PetalMark";
import { ArchDivider } from "./ArchDivider";
import { PetalMark3D } from "@/components/animations/PetalMark3D";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { TaaOrbit } from "./TaaOrbit";

const LANDING_MS = 3800;
const LANDING_MS_REDUCED = 1200;

export function Hero({
  onContinue,
  active,
}: {
  onContinue: () => void;
  active: boolean;
}) {
  const { locale, t } = useI18n();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    const delay = reduce ? LANDING_MS_REDUCED : LANDING_MS;
    const id = window.setTimeout(onContinue, delay);
    return () => window.clearTimeout(id);
  }, [active, onContinue, reduce]);

  return (
    <header className="relative isolate flex min-h-dvh min-h-svh flex-col items-center justify-center overflow-hidden bg-forest py-[clamp(4rem,12vh,7rem)] text-cream screen-gutter">
      <TaaOrbit />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_22%,rgb(35_48_37_/_0.62)_100%)]" />

      <div
        className="absolute inset-x-0 top-0 z-20 flex justify-end screen-gutter"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <LanguageSwitcher />
      </div>

      <motion.div
        className="relative z-10 flex w-full max-w-[min(40rem,92vw)] flex-col items-center text-center"
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      >
        <PetalMark3D className="size-[clamp(4.5rem,16vw,8.5rem)]" title="Tabkha" />

        <div className="mt-[clamp(1.25rem,4vh,2.5rem)] flex flex-col items-center gap-4">
          {locale === "ar" ? (
            <>
              <WordmarkAr className="h-[clamp(2.4rem,7.5vw,4.25rem)] w-[min(22rem,86vw)]" />
              <WordmarkLatin className="h-[clamp(1rem,2.8vw,1.5rem)] w-[min(18rem,76vw)] opacity-80" />
            </>
          ) : (
            <>
              <WordmarkLatin className="h-[clamp(1.5rem,4.5vw,2.6rem)] w-[min(24rem,86vw)]" />
              <WordmarkAr className="h-[clamp(1.9rem,5.5vw,3.2rem)] w-[min(18rem,76vw)] opacity-80" />
            </>
          )}
          <ArchDivider className="mt-2 text-terracotta" />
          <p className="font-copy mt-2 max-w-md text-pretty text-[clamp(0.95rem,2.2vw,1.35rem)] leading-relaxed text-cream/85">
            {locale === "ar"
              ? "حيث يلتقي المطبخ الشرقي برقيّ التفاصيل العالمية"
              : "Where Eastern cuisine meets the elegance of global detail"}
          </p>
        </div>
      </motion.div>

      <button
        type="button"
        onClick={onContinue}
        className="relative z-10 mt-[clamp(1.5rem,6vh,4rem)] min-h-11 text-[0.7rem] tracking-[0.35em] uppercase text-cream/70"
      >
        {t.explore}
      </button>
    </header>
  );
}
