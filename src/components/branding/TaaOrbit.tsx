import { motion, useReducedMotion } from "motion/react";
import { TaaMark } from "./PetalMark";

const LETTERS = 20;
const RING = "95vh";

const EDGE_MASK =
  "linear-gradient(to right, #000 0%, #000 28%, transparent 38%, transparent 62%, #000 72%, #000 100%)";

function TaaRing({
  reverse,
  duration,
}: {
  reverse?: boolean;
  duration: number;
}) {
  const reduce = useReducedMotion();
  const letters = Array.from({ length: LETTERS }, (_, index) => (360 / LETTERS) * index);

  return (
    <motion.div
      className="absolute inset-0"
      animate={reduce ? undefined : { rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {letters.map((deg) => (
        <span key={deg} className="absolute top-1/2 left-1/2 h-0 w-0" style={{ transform: `rotate(${deg}deg)` }}>
          <span
            className="absolute"
            style={{
              left: 0,
              top: `calc(${RING} * -0.48)`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <TaaMark className="h-[clamp(1.9rem,5vw,2.9rem)] w-[clamp(1.35rem,3.5vw,2.1rem)]" />
          </span>
        </span>
      ))}
    </motion.div>
  );
}

/** Identity ط as spinning half-circles, visible only on the left and right edges. */
export function TaaOrbit() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden text-sage"
      aria-hidden
      style={{
        maskImage: EDGE_MASK,
        WebkitMaskImage: EDGE_MASK,
      }}
    >
      <div className="absolute top-1/2 left-0 size-[95vh] -translate-x-1/2 -translate-y-1/2">
        <TaaRing duration={36} />
      </div>
      <div className="absolute top-1/2 right-0 size-[95vh] translate-x-1/2 -translate-y-1/2">
        <TaaRing duration={42} reverse />
      </div>
    </div>
  );
}
