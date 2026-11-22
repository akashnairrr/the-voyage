'use client';

import { useEffect, useRef, useState } from 'react';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Slow start, fast middle, slow arrival: reads as a jump to warp and back. */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** How long a jump of `delta` points takes. Bigger jumps last a bit longer. */
export const jumpDuration = (delta: number) => Math.min(2600, 900 + delta * 12);

/**
 * Animates from the previous value to `target`. Everything that reads the
 * returned value (distance, date, journey bar, starfield speed) moves together.
 */
export function useTweenedNumber(
  target: number,
  options: { from?: number; duration?: (delta: number) => number } = {},
): number {
  const { from = target, duration = jumpDuration } = options;
  const [value, setValue] = useState(from);
  const current = useRef(from);
  const durationRef = useRef(duration);
  durationRef.current = duration;

  useEffect(() => {
    const start = current.current;
    const delta = target - start;
    if (delta === 0) return;
    if (prefersReducedMotion()) {
      current.current = target;
      setValue(target);
      return;
    }
    const ms = durationRef.current(Math.abs(delta));
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      current.current = start + delta * easeInOutCubic(t);
      setValue(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}
