import { useI18n } from "@/lib/i18n";
import { ArchDivider } from "./ArchDivider";
import { Atmosphere } from "@/components/animations/Atmosphere";
import { PetalMark3D } from "@/components/animations/PetalMark3D";
import type { Restaurant } from "@/types/menu";

export function BrandStory({ restaurant }: { restaurant: Restaurant }) {
  const { locale, t } = useI18n();

  return (
    <section
      id="story"
      className="relative overflow-hidden bg-forest py-[clamp(4rem,10vh,7rem)] text-cream screen-gutter"
    >
      <Atmosphere tone="forest" />
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-8 flex justify-center text-cream">
          <PetalMark3D className="size-16 sm:size-20" />
        </div>
        <p className="text-[0.7rem] tracking-[0.4em] uppercase text-sage">{t.story}</p>
        <h2 className="font-copy mt-4 text-[clamp(1.6rem,4vw,2.4rem)]">
          {locale === "ar" ? restaurant.nameAr : restaurant.nameEn}
        </h2>
        <ArchDivider className="mt-6 text-terracotta" />
        <p className="font-copy mt-10 text-pretty text-[clamp(1rem,2.2vw,1.2rem)] leading-[1.9] text-cream/88">
          {locale === "ar" ? restaurant.storyAr : restaurant.storyEn}
        </p>
      </div>
    </section>
  );
}
