"use client";

import { useEffect, useState } from "react";
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
      staggerChildren: 0.1, // 100 ms between each letter
      delayChildren: 0.4,    // Small pause before starting
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
      duration: 0.8,
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
  const [showCursor, setShowCursor] = useState(true);

  // Calcula cuándo termina la animación de revelado
  // (número de letras × 100ms de stagger + 400ms de delay inicial + 800ms de animación)
  const totalRevealTime = letters.length * 100 + 400 + 800;

  useEffect(() => {
    // Desaparece el cursor 2 segundos después de que termine el reveal
    const timer = setTimeout(() => {
      setShowCursor(false);
    }, totalRevealTime + 2000);

    return () => clearTimeout(timer);
  }, [totalRevealTime]);

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
      {/* Terminal blinking cursor – solo CSS, sin interferir con las letras */}
      {showCursor && (
        <motion.span
          className="terminal-cursor inline-block"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      )}
    </motion.h1>
  );
}
