import { motion, useReducedMotion } from "motion/react";
import { PetalMark } from "@/components/branding/PetalMark";

/** Gentle turn of the facade mark — no extrusion, so the sparkle stays readable. */
export function PetalMark3D({
  className = "size-28",
  title,
}: {
  className?: string;
  title?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={`relative ${className}`} style={{ perspective: "900px" }}>
      <motion.div
        className="h-full w-full"
        animate={reduce ? undefined : { rotateY: [10, -10, 10] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <PetalMark className="h-full w-full" title={title} />
      </motion.div>
    </div>
  );
}
