import { motion, useReducedMotion } from "motion/react";
import { PetalMark } from "@/components/branding/PetalMark";

/** Extruded four-petal mark: stacked copies along Z so the logo reads as a physical object. */
export function PetalMark3D({
  className = "size-28",
  title,
}: {
  className?: string;
  title?: string;
}) {
  const reduce = useReducedMotion();
  const layers = reduce ? 1 : 7;

  return (
    <div className={`relative ${className}`} style={{ perspective: "900px" }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={
          reduce
            ? undefined
            : { rotateY: [12, -14, 12], rotateX: [8, -6, 8], z: [0, 22, 0] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {Array.from({ length: layers }, (_, index) => (
          <span
            key={index}
            className="absolute inset-0"
            style={{
              transform: `translateZ(${-index * 3}px)`,
              opacity: index === 0 ? 1 : 0.12,
              color: index === 0 ? "currentColor" : "#9b6a51",
            }}
          >
            <PetalMark className="h-full w-full" title={index === 0 ? title : undefined} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
