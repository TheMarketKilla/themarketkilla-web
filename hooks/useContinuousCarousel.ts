"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for a continuous carousel effect.
 * Moves content at a constant speed using requestAnimationFrame.
 * Supports pausing on hover.
 */
export function useContinuousCarousel(speed = 0.5) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollPosRef = useRef(0);

  const animate = useCallback(() => {
    if (!containerRef.current) return;

    if (!isPaused) {
      scrollPosRef.current -= speed;
      const halfWidth = containerRef.current.scrollWidth / 2;

      if (Math.abs(scrollPosRef.current) >= halfWidth) {
        scrollPosRef.current = 0;
      }

      containerRef.current.style.transform = `translateX(${scrollPosRef.current}px)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [speed, isPaused]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animate]);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  return {
    containerRef,
    isPaused,
    handleMouseEnter,
    handleMouseLeave,
  };
}
