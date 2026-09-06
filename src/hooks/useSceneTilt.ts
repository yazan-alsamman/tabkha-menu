import { useEffect, useRef } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";

/** Idle + touch tilt for phones. Gyro is optional; the scene must move without it. */
export function useSceneTilt(intensity = 10) {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateY = useSpring(rawX, { stiffness: 70, damping: 16, mass: 0.55 });
  const rotateX = useSpring(rawY, { stiffness: 70, damping: 16, mass: 0.55 });
  const holding = useRef(false);

  useEffect(() => {
    if (reduce) return;

    const onMove = (event: PointerEvent) => {
      holding.current = true;
      const nx = (event.clientX / window.innerWidth - 0.5) * 2;
      const ny = (event.clientY / window.innerHeight - 0.5) * 2;
      rawX.set(nx * intensity);
      rawY.set(-ny * intensity * 0.7);
    };
    const onUp = () => {
      holding.current = false;
    };
    const onOrient = (event: DeviceOrientationEvent) => {
      if (holding.current || event.gamma == null || event.beta == null) return;
      rawX.set((event.gamma / 28) * intensity);
      rawY.set(((event.beta - 45) / 36) * intensity * 0.55);
    };

    let t = 0;
    let frame = 0;
    const idle = (now: number) => {
      t = now / 1000;
      if (!holding.current) {
        rawX.set(Math.sin(t * 0.7) * intensity * 0.85);
        rawY.set(Math.cos(t * 0.5) * intensity * 0.45);
      }
      frame = requestAnimationFrame(idle);
    };
    frame = requestAnimationFrame(idle);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, [intensity, rawX, rawY, reduce]);

  return { rotateX, rotateY };
}
