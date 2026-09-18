import { motion, useReducedMotion } from "motion/react";
import { PetalMark, TabkhaGlyph } from "@/components/branding/PetalMark";

const NODES = [
  { x: 4, y: 5, s: 2.5, delay: 0.2, glyph: true, rot: -41 },
  { x: 83, y: 1, s: 3.05, delay: 1.3, glyph: false, rot: 52 },
  { x: 58, y: 9, s: 2.15, delay: 0.6, glyph: true, rot: 17 },
  { x: -5, y: 27, s: 3.2, delay: 1.8, glyph: false, rot: -27 },
  { x: 91, y: 24, s: 2.35, delay: 0.4, glyph: true, rot: 68 },
  { x: 17, y: 49, s: 2.7, delay: 2.1, glyph: false, rot: 9 },
  { x: 71, y: 57, s: 2.2, delay: 0.9, glyph: true, rot: -58 },
  { x: 38, y: 71, s: 2.9, delay: 1.5, glyph: true, rot: -13 },
  { x: -3, y: 84, s: 2.3, delay: 0.1, glyph: false, rot: 34 },
  { x: 86, y: 88, s: 2.55, delay: 2.4, glyph: true, rot: -46 },
];

/** Visible brand motion for phone QR sessions — cream and forest sections both feel alive. */
export function Atmosphere({ tone }: { tone: "cream" | "forest" }) {
  const reduce = useReducedMotion();
  const color = tone === "cream" ? "text-terracotta/35" : "text-cream/28";

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${color}`}
      aria-hidden
      style={{ perspective: "900px" }}
    >
      <div className="atmosphere-sheen absolute inset-0" />
      {NODES.map((node, index) => (
        <motion.div
          key={index}
          className="absolute will-change-transform"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.s}rem`,
            transformStyle: "preserve-3d",
          }}
          animate={
            reduce
              ? undefined
              : {
                  x: [0, index % 2 === 0 ? 10 : -12, 0],
                  y: [0, index % 3 === 0 ? -16 : -9, 0],
                  rotateY: [0, index % 2 === 0 ? 22 : -18, 0],
                  rotateZ: [node.rot, node.rot + (index % 2 === 0 ? 18 : -14), node.rot],
                }
          }
          transition={{ duration: 6.5 + index * 0.55, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
        >
          {node.glyph ? (
            <TabkhaGlyph className="aspect-[2/1] h-auto w-full" />
          ) : (
            <PetalMark className="aspect-square h-auto w-full" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
