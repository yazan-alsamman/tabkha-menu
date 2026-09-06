import { motion, useReducedMotion } from "motion/react";
import { PetalMark, TabkhaGlyph } from "@/components/branding/PetalMark";
import { useSceneTilt } from "@/hooks/useSceneTilt";

const ORBIT = [0, 72, 144, 216, 288];

const DRIFT = [
  { left: "4%", top: "12%", z: 70, s: 0.62, delay: 0, glyph: false },
  { left: "70%", top: "8%", z: -50, s: 0.72, delay: 0.6, glyph: true },
  { left: "2%", top: "58%", z: 40, s: 0.5, delay: 1.1, glyph: true },
  { left: "68%", top: "62%", z: -40, s: 0.66, delay: 0.3, glyph: false },
];

/** CSS 3D stage sized so the motion is obvious on a phone after a QR scan. */
export function Scene3D() {
  const reduce = useReducedMotion();
  const { rotateX, rotateY } = useSceneTilt(11);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
      style={{ perspective: "900px" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformOrigin: "50% 42%" }}
      >
        {reduce ? null : (
          <div className="absolute top-[40%] left-1/2 h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              {ORBIT.map((angle) => (
                <div
                  key={angle}
                  className="absolute top-0 left-0 text-terracotta/55"
                  style={{
                    width: "clamp(2.6rem, 9vw, 4rem)",
                    marginTop: "-1.5rem",
                    marginLeft: "-1.5rem",
                    transform: `rotateY(${angle}deg) translateZ(min(34vw, 7.5rem))`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <PetalMark className="aspect-square h-auto w-full" />
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {DRIFT.map((node, index) => (
          <motion.div
            key={index}
            className="absolute text-cream/40"
            style={{
              left: node.left,
              top: node.top,
              z: reduce ? 0 : node.z,
              width: `${node.s * 10}rem`,
              transformStyle: "preserve-3d",
            }}
            animate={reduce ? undefined : { y: [0, -28, 0], rotateZ: [0, 14, 0] }}
            transition={{ duration: 8 + index, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
          >
            {node.glyph ? (
              <TabkhaGlyph className="aspect-[2/1] h-auto w-full" />
            ) : (
              <PetalMark className="aspect-square h-auto w-full" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
