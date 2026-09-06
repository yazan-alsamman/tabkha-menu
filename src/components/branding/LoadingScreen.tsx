import { motion, useReducedMotion } from "motion/react";
import { PetalMark3D } from "@/components/animations/PetalMark3D";

export function LoadingScreen({ visible }: { visible: boolean }) {
  const reduce = useReducedMotion();
  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-loader flex items-center justify-center bg-forest text-cream"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-busy="true"
      aria-live="polite"
    >
      <motion.div
        animate={reduce ? undefined : { opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <PetalMark3D className="size-24" title="طبخة آند مور" />
      </motion.div>
    </motion.div>
  );
}
