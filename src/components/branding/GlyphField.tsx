import { motion, useReducedMotion } from "motion/react";
import { TabkhaGlyph } from "./PetalMark";

const NODES = [
  { x: 8, y: 12, r: -18, s: 1, z: 40 },
  { x: 78, y: 8, r: 24, s: 0.7, z: -50 },
  { x: 52, y: 18, r: 8, s: 1.2, z: 20 },
  { x: 18, y: 38, r: -42, s: 0.85, z: 70 },
  { x: 88, y: 34, r: 16, s: 1.1, z: -30 },
  { x: 6, y: 62, r: 32, s: 0.9, z: 10 },
  { x: 42, y: 58, r: -12, s: 1.35, z: -70 },
  { x: 72, y: 66, r: 48, s: 0.75, z: 35 },
  { x: 28, y: 82, r: -28, s: 1, z: -20 },
  { x: 91, y: 80, r: 6, s: 0.8, z: 55 },
  { x: 58, y: 90, r: -50, s: 0.95, z: -40 },
  { x: 4, y: 90, r: 20, s: 0.65, z: 15 },
];

export function GlyphField({ tone = "sage" }: { tone?: "sage" | "forest" }) {
  const reduce = useReducedMotion();
  const color = tone === "sage" ? "text-cream/32" : "text-forest/18";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${color}`}
      aria-hidden
      style={{ perspective: "1400px" }}
    >
      {NODES.map((node, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${7 * node.s}rem`,
            z: reduce ? 0 : node.z,
            transformStyle: "preserve-3d",
          }}
          animate={
            reduce
              ? undefined
              : { y: [0, -26, 0], rotate: [node.r, node.r + 16, node.r], rotateY: [0, 28, 0] }
          }
          transition={{ duration: 8 + index * 0.7, repeat: Infinity, ease: "easeInOut" }}
        >
          <TabkhaGlyph className="aspect-[2/1] h-auto w-full" />
        </motion.div>
      ))}
    </div>
  );
}
