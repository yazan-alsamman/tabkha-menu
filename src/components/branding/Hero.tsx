import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { WordmarkAr, WordmarkLatin } from "./PetalMark";
import { ArchDivider } from "./ArchDivider";
import { PetalMark3D } from "@/components/animations/PetalMark3D";
import { LanguageSwitcher } from "@/components/navigation/LanguageSwitcher";
import { TaaOrbit } from "./TaaOrbit";
import { VegaCoreMark } from "./VegaCoreMark";
import { InstagramIcon } from "./SocialIcons";
import { INSTAGRAM_URL } from "@/lib/contact";

export function Hero({ onContinue }: { onContinue: () => void }) {
  const { locale, t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <header className="relative isolate flex min-h-dvh min-h-svh flex-col items-center justify-center overflow-hidden bg-forest pt-[clamp(4rem,12vh,7rem)] pb-[8.75rem] text-cream screen-gutter">
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
        className="relative z-10 mt-[clamp(1.5rem,6vh,4rem)] min-h-12 rounded-full border border-cream/30 px-8 text-[0.7rem] tracking-[0.35em] uppercase text-cream"
      >
        {t.explore}
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="grid size-11 place-items-center text-cream/70"
          aria-label="Instagram"
        >
          <InstagramIcon />
        </a>
        <p className="text-[0.55rem] tracking-[0.28em] uppercase text-sage">{t.designedBy}</p>
        <VegaCoreMark tone="cream" />
      </div>
    </header>
  );
}
