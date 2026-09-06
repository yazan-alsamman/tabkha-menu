import { motion, useReducedMotion } from "motion/react";
import { PetalMark, TabkhaGlyph } from "@/components/branding/PetalMark";

const NODES = [
  { x: -6, y: 8, s: 7.2, delay: 0, glyph: true, rot: -18 },
  { x: 72, y: 4, s: 5.4, delay: 0.8, glyph: false, rot: 12 },
  { x: 8, y: 42, s: 4.6, delay: 1.4, glyph: false, rot: -8 },
  { x: 78, y: 48, s: 6.4, delay: 0.4, glyph: true, rot: 22 },
  { x: 38, y: 72, s: 8, delay: 1.1, glyph: true, rot: -28 },
  { x: 88, y: 82, s: 4.2, delay: 1.8, glyph: false, rot: 6 },
];

/** Visible brand motion for phone QR sessions — cream and forest sections both feel alive. */
export function Atmosphere({ tone }: { tone: "cream" | "forest" }) {
  const reduce = useReducedMotion();
  const color = tone === "cream" ? "text-terracotta/35" : "text-cream/28";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${color}`}
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
                  y: [0, -22, 0],
                  rotateY: [0, 28, 0],
                  rotateZ: [node.rot, node.rot + 12, node.rot],
                }
          }
          transition={{ duration: 7 + index * 0.9, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
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
