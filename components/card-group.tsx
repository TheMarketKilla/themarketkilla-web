"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// ---------------------------------------------------------------------------
// CardGroup – Contenedor con efecto cascada (stagger)
// ---------------------------------------------------------------------------

export const CardGroup = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// CardItem – Tarjeta individual con animación según su posición
// ---------------------------------------------------------------------------

export const CardItem = ({ children, position = "center" }: { children: React.ReactNode; position?: "left" | "center" | "right" }) => {
  const getHidden = () => {
    if (position === "left") return { opacity: 0, x: -30 };
    if (position === "right") return { opacity: 0, x: 30 };
    return { opacity: 0, y: 30 };
  };

  const variants = {
    hidden: getHidden(),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    },
  };

  return <motion.div variants={variants as any}>{children}</motion.div>;
};
