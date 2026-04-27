"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom hook that animates a number from a start value to a target value.
 * Uses requestAnimationFrame for smooth animation.
 */
export function useCountUp(
  target: number,
  duration = 1500,
  decimals = 0,
  startOnView = false,
  isInView = true,
  startFrom = 0,
) {
  const [count, setCount] = useState(startFrom);
  const [hasAnimated, setHasAnimated] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasAnimated) return;

    const range = target - startFrom;

    const easeOut = (t: number) => {
      // cubic-bezier(0.16, 1, 0.3, 1) approximation
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easedProgress = easeOut(progress);

      setCount(startFrom + easedProgress * range);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
        setHasAnimated(true);
      }
    };

    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, startOnView, isInView, hasAnimated, startFrom]);

  return Number(count.toFixed(decimals));
}
