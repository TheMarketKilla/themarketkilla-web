"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type AnimatedTitleProps = {
  text: string;
  className?: string;
};

// ---------------------------------------------------------------------------
// Component – Typewriter effect with traveling cursor
// ---------------------------------------------------------------------------

export function AnimatedTitle({ text, className }: AnimatedTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLHeadingElement>(null);
  const [progress, setProgress] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [charWidths, setCharWidths] = useState<number[]>([]);
  const totalLetters = text.length;

  // Medir los anchos de cada letra UNA SOLA VEZ al montar
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const spans = el.children;
    const widths: number[] = [];
    let accumulated = 0;
    for (let i = 0; i < spans.length; i++) {
      const span = spans[i] as HTMLElement;
      accumulated += span.offsetWidth;
      widths.push(accumulated);
    }
    setCharWidths(widths);
  }, []);

  // Revelar letras una por una
  useEffect(() => {
    const startTimer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setProgress(i / totalLetters);
        if (i >= totalLetters) {
          clearInterval(interval);
          setTimeout(() => {
            setCursorVisible(false);
          }, 2000);
        }
      }, 100);

      return () => clearInterval(interval);
    }, 400);

    return () => clearTimeout(startTimer);
  }, [totalLetters]);

  // Calcular posición del cursor basado en las letras reveladas
  const visibleCount = Math.round(progress * totalLetters);
  const cursorX = visibleCount > 0 && charWidths.length > 0
    ? charWidths[Math.min(visibleCount - 1, charWidths.length - 1)]
    : 0;

  return (
    <div ref={containerRef} className="relative inline-flex" style={{ lineHeight: 1.2 }}>
      {/* Texto oculto para medir (misma clase, opaco) – siempre visible para medición */}
      <h1
        ref={measureRef}
        className={className}
        aria-hidden="true"
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: -1,
        }}
      >
        {text.split("").map((letter, i) => (
          <span key={i} style={{ display: "inline-block" }}>
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </h1>

      {/* Texto visible con clip progresivo */}
      <h1
        className={className}
        style={{
          whiteSpace: "nowrap",
          clipPath: `inset(0 ${100 - progress * 100}% 0 0)`,
          WebkitClipPath: `inset(0 ${100 - progress * 100}% 0 0)`,
          transition: `clip-path 0.1s ease, -webkit-clip-path 0.1s ease`,
        }}
      >
        {text.split("").map((letter, i) => (
          <span key={i} style={{ display: "inline-block" }}>
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </h1>

      {/* Cursor viajero – se posiciona exactamente al final del texto revelado */}
      {cursorVisible && (
        <span
          ref={cursorRef}
          className="terminal-cursor"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${cursorX}px`,
            top: "0.15em",
            width: "4px",
            height: "3.5em",
            backgroundColor: "#3B82F6",
            borderRadius: "2px",
            display: "block",
            animation: "blink 1s step-end infinite",
            transition: `left 0.12s ease`,
            zIndex: 2,
            boxShadow: "0 0 10px rgba(59,130,246,0.7)",
          }}
        />
      )}
    </div>
  );
}

