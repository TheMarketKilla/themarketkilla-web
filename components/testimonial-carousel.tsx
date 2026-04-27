"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useContinuousCarousel } from "@/hooks/useContinuousCarousel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VerifiedResult = {
  user: string;
  winrate: string;
  profit: string;
  drawdown: string;
  comment: string;
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const verifiedResults: VerifiedResult[] = [
  {
    user: "@CryptoAlphaMX",
    winrate: "87%",
    profit: "+245%",
    drawdown: "6.2%",
    comment: "La estrategia momentum fue consistente incluso en semanas volatiles.",
  },
  {
    user: "@ForexPulse",
    winrate: "82%",
    profit: "+198%",
    drawdown: "7.1%",
    comment: "Recupere mi cuenta y ahora opero con reglas claras y sin ansiedad.",
  },
  {
    user: "@ScalpVision",
    winrate: "89%",
    profit: "+276%",
    drawdown: "5.8%",
    comment: "El bot detecta entradas limpias en sesiones de Londres y Nueva York.",
  },
  {
    user: "@PipsAndBlocks",
    winrate: "85%",
    profit: "+221%",
    drawdown: "6.9%",
    comment: "Excelente gestion de riesgo, muy dificil volver al trading manual.",
  },
  {
    user: "@QuantNexus",
    winrate: "91%",
    profit: "+304%",
    drawdown: "5.4%",
    comment: "La curva de equity subio de forma estable durante tres meses seguidos.",
  },
  {
    user: "@BullBearFlow",
    winrate: "84%",
    profit: "+187%",
    drawdown: "7.6%",
    comment: "Ideal para combinar crypto y forex sin estar pegado a la pantalla.",
  },
  {
    user: "@NeoTraderFX",
    winrate: "88%",
    profit: "+259%",
    drawdown: "6.1%",
    comment: "Automatizacion premium, ejecucion rapida y resultados muy solidos.",
  },
  {
    user: "@MacroSniper",
    winrate: "83%",
    profit: "+203%",
    drawdown: "7.3%",
    comment: "Disminui errores emocionales y aumente la consistencia semanal.",
  },
  {
    user: "@VaultSignals",
    winrate: "90%",
    profit: "+291%",
    drawdown: "5.6%",
    comment: "El plan Pro supero mis expectativas en rendimiento ajustado a riesgo.",
  },
  {
    user: "@DeltaWavePro",
    winrate: "86%",
    profit: "+233%",
    drawdown: "6.8%",
    comment: "Setup muy estable para cuentas fondeadas y objetivos mensuales exigentes.",
  },
];

// ---------------------------------------------------------------------------
// Simple donut chart (SVG)
// ---------------------------------------------------------------------------

function WinrateDonut({ winrate }: { winrate: string }) {
  const value = Number.parseInt(winrate, 10);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0">
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="4"
      />
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        stroke="url(#donutGradient)"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <defs>
        <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <text
        x="20"
        y="22"
        textAnchor="middle"
        fill="#a78bfa"
        fontSize="9"
        fontWeight="bold"
      >
        {value}%
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Single Testimonial Card
// ---------------------------------------------------------------------------

function TestimonialCard({ result }: { result: VerifiedResult }) {
  return (
    <Card className="glass-panel min-w-[280px] border-white/10 bg-white/5 sm:min-w-[320px]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WinrateDonut winrate={result.winrate} />
            <p className="text-lg font-semibold text-zinc-100">{result.user}</p>
          </div>
          <Badge className="border-emerald-400/35 bg-emerald-400/12 text-emerald-200">
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
            {result.winrate} Winrate
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm sm:text-base">
          <div>
            <p className="text-zinc-400">Profit total</p>
            <p className="font-semibold text-emerald-300">{result.profit}</p>
          </div>
          <div>
            <p className="text-zinc-400">Drawdown</p>
            <p className="font-semibold text-violet-200">{result.drawdown}</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">{result.comment}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Continuous Carousel Component
// ---------------------------------------------------------------------------

export function TestimonialCarousel() {
  const { containerRef, handleMouseEnter, handleMouseLeave } = useContinuousCarousel(0.5);

  return (
    <section className="space-y-6" id="resultados-verificados">
      <h2 className="text-3xl font-bold sm:text-4xl">Resultados Verificados</h2>
      <div
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={
          {
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 80px, rgba(0,0,0,1) calc(100% - 80px), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 80px, rgba(0,0,0,1) calc(100% - 80px), transparent 100%)",
          } as React.CSSProperties
        }
      >
        <div
          ref={containerRef}
          className="flex w-max gap-4 sm:gap-5 will-change-transform"
          style={{ transform: "translateX(0)" }}
        >
          {[...verifiedResults, ...verifiedResults].map((result, index) => (
            <TestimonialCard key={`${result.user}-${index}`} result={result} />
          ))}
        </div>
      </div>
    </section>
  );
}
