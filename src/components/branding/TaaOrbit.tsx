import { motion, useReducedMotion } from "motion/react";
import { TaaMark } from "./PetalMark";

const LETTERS = 32;
const RING = "min(68vh, 34rem)";

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
            <TaaMark className="h-[clamp(1.7rem,4.4vw,2.5rem)] w-[clamp(1.2rem,3.1vw,1.8rem)]" />
          </span>
        </span>
      ))}
    </motion.div>
  );
}

/** Identity ط spinning in the top-right and bottom-left corners. */
export function TaaOrbit() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-sage" aria-hidden>
      <div className="absolute top-0 right-0 size-[min(68vh,34rem)] translate-x-[46%] -translate-y-[46%]">
        <TaaRing duration={32} />
      </div>
      <div className="absolute bottom-0 left-0 size-[min(68vh,34rem)] -translate-x-[46%] translate-y-[46%]">
        <TaaRing duration={38} reverse />
      </div>
    </div>
  );
}
