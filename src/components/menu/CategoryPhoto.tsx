import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { resolveMenuImage } from "@/lib/images";

export function CategoryPhoto({
  slug,
  alt,
  fill,
}: {
  slug: string;
  alt: string;
  fill?: boolean;
}) {
  const image = resolveMenuImage(slug);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.12, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  if (!image.src) return null;

  return (
    <div ref={ref} className={`relative overflow-hidden bg-forest/10 ${fill ? "h-full" : ""}`} style={{ perspective: "800px" }}>
      <div
        className="absolute inset-0 scale-110 blur-2xl"
        style={{ backgroundImage: `url(${image.placeholder})`, backgroundSize: "cover" }}
        aria-hidden
      />
      <motion.img
        src={image.src}
        srcSet={image.srcSet}
        sizes="(min-width: 1536px) 520px, (min-width: 768px) 42vw, 100vw"
        alt={alt}
        loading="lazy"
        decoding="async"
        className={fill ? "relative z-10 h-full w-full object-cover" : "relative z-10 aspect-[4/3] h-auto w-full object-cover"}
        style={{ scale, y }}
      />
    </div>
  );
}
