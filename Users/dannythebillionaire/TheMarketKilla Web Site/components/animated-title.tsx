"use client";

import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Cubic-bezier master easing
// ---------------------------------------------------------------------------

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// Container variants – controls the stagger delay between letters
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04, // 40 ms between each letter
      delayChildren: 0.2,    // Small pause before starting
    },
  },
};

// ---------------------------------------------------------------------------
// Letter variants – each letter animates from invisible/above to visible/normal
// ---------------------------------------------------------------------------

const letterVariants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE,
    },
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type AnimatedTitleProps = {
  text: string;
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnimatedTitle({ text, className }: AnimatedTitleProps) {
  const letters = text.split("");

  return (
    <motion.h1
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          style={{ display: "inline-block" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
}
