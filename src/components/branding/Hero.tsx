import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { WordmarkAr, WordmarkLatin } from "./PetalMark";
import { GlyphField } from "./GlyphField";
import { ArchDivider } from "./ArchDivider";
import { Scene3D } from "@/components/animations/Scene3D";
import { PetalMark3D } from "@/components/animations/PetalMark3D";

export function Hero() {
  const { locale, t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <header className="relative isolate flex min-h-dvh min-h-svh flex-col items-center justify-center overflow-hidden bg-forest py-[clamp(4rem,12vh,7rem)] text-cream screen-gutter [@media(max-height:540px)_and_(orientation:landscape)]:min-h-0 [@media(max-height:540px)_and_(orientation:landscape)]:flex-row [@media(max-height:540px)_and_(orientation:landscape)]:justify-center [@media(max-height:540px)_and_(orientation:landscape)]:gap-8 [@media(max-height:540px)_and_(orientation:landscape)]:py-6">
      <GlyphField />
      <Scene3D />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgb(35_48_37_/_0.55)_100%)]" />

      <motion.div
        className="relative z-10 flex w-full max-w-[min(40rem,92vw)] flex-col items-center text-center [transform:translateZ(0)] [@media(max-height:540px)_and_(orientation:landscape)]:max-w-none [@media(max-height:540px)_and_(orientation:landscape)]:flex-row [@media(max-height:540px)_and_(orientation:landscape)]:gap-6"
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      >
        <PetalMark3D className="size-[clamp(4.5rem,16vw,8.5rem)] [@media(max-height:540px)_and_(orientation:landscape)]:size-20" title="Tabkha" />

        <div className="mt-[clamp(1.25rem,4vh,2.5rem)] flex flex-col items-center gap-4 [@media(max-height:540px)_and_(orientation:landscape)]:mt-0">
          {locale === "ar" ? (
            <>
              <WordmarkAr className="h-[clamp(2.4rem,7.5vw,4.25rem)] w-[min(22rem,86vw)] [@media(max-height:540px)_and_(orientation:landscape)]:h-10 [@media(max-height:540px)_and_(orientation:landscape)]:w-[min(16rem,42vw)]" />
              <WordmarkLatin className="h-[clamp(1rem,2.8vw,1.5rem)] w-[min(18rem,76vw)] opacity-80 [@media(max-height:540px)_and_(orientation:landscape)]:h-4 [@media(max-height:540px)_and_(orientation:landscape)]:w-[min(14rem,38vw)]" />
            </>
          ) : (
            <>
              <WordmarkLatin className="h-[clamp(1.5rem,4.5vw,2.6rem)] w-[min(24rem,86vw)] [@media(max-height:540px)_and_(orientation:landscape)]:h-8 [@media(max-height:540px)_and_(orientation:landscape)]:w-[min(18rem,42vw)]" />
              <WordmarkAr className="h-[clamp(1.9rem,5.5vw,3.2rem)] w-[min(18rem,76vw)] opacity-80 [@media(max-height:540px)_and_(orientation:landscape)]:h-8 [@media(max-height:540px)_and_(orientation:landscape)]:w-[min(14rem,38vw)]" />
            </>
          )}
          <ArchDivider className="mt-2 text-terracotta [@media(max-height:540px)_and_(orientation:landscape)]:hidden" />
          <p className="font-copy mt-2 max-w-md text-pretty text-[clamp(0.95rem,2.2vw,1.35rem)] leading-relaxed text-cream/85 [@media(max-height:540px)_and_(orientation:landscape)]:mt-0 [@media(max-height:540px)_and_(orientation:landscape)]:max-w-xs [@media(max-height:540px)_and_(orientation:landscape)]:text-start [@media(max-height:540px)_and_(orientation:landscape)]:text-sm">
            {locale === "ar"
              ? "حيث يلتقي المطبخ الشرقي برقيّ التفاصيل العالمية"
              : "Where Eastern cuisine meets the elegance of global detail"}
          </p>
        </div>
      </motion.div>

      <button
        type="button"
        onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className="relative z-10 mt-[clamp(1.5rem,6vh,4rem)] flex min-h-11 flex-col items-center gap-2 text-[0.7rem] tracking-[0.35em] uppercase text-cream/70 [@media(max-height:540px)_and_(orientation:landscape)]:mt-0"
      >
        <span>{t.scroll}</span>
        <motion.span
          className="block h-10 w-px origin-top bg-cream/40 [@media(max-height:540px)_and_(orientation:landscape)]:h-6"
          animate={reduce ? undefined : { scaleY: [0.55, 1, 0.55], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </button>
    </header>
  );
}
