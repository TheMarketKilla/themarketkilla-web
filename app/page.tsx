"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketWidgets } from "@/components/market-widgets";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { EquityChart } from "@/components/equity-chart";
import { ParticlesBackground } from "@/components/particles-background";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Bot,
  CandlestickChart,
  CheckCircle2,
  Crown,
  Gem,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Cubic-bezier master easing
// ---------------------------------------------------------------------------

const EASE = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const strategies = [
  {
    icon: Bot,
    title: "Scalping de Alta Frecuencia",
    description: "Ejecucion algoritmica en marcos de 1m a 5m para capturar micro-movimientos con slippage controlado.",
  },
  {
    icon: TrendingUp,
    title: "Momentum Multi-Timeframe",
    description: "Confirma tendencias en H1 y H4 antes de entrar para filtrar ruido y aumentar la consistencia.",
  },
  {
    icon: ShieldCheck,
    title: "Mean Reversion Protegida",
    description: "Detecta sobreextensiones y usa cobertura dinamica para limitar exposicion durante eventos volatiles.",
  },
  {
    icon: CandlestickChart,
    title: "Breakout de Sesiones",
    description: "Opera rupturas en aperturas de Londres y NY con reglas claras de volumen y confirmacion.",
  },
  {
    icon: Zap,
    title: "Arbitraje de Correlacion",
    description: "Aprovecha divergencias temporales entre pares correlacionados de Crypto y Forex.",
  },
];

const metricsConfig = [
  { label: "Winrate", startValue: 71.2, min: 70.0, max: 73.4, decimals: 1, suffix: "%" },
  { label: "Profit Factor", startValue: 2.3, min: 2.3, max: 2.65, decimals: 2, suffix: "" },
  { label: "Max Drawdown", startValue: 4.8, min: 4.8, max: 6.3, decimals: 1, prefix: "-", suffix: "%", invert: true },
  { label: "Trades Mensuales", startValue: 22, min: 22, max: 65, decimals: 0, suffix: "+" },
];

const steps = [
  {
    title: "Conecta tu exchange o broker",
    description: "Integracion segura por API con permisos de trading sin retiros.",
  },
  {
    title: "Activa estrategias en 1 clic",
    description: "Selecciona perfiles de riesgo y mercados desde un panel intuitivo.",
  },
  {
    title: "El bot ejecuta 24/7",
    description: "Motor automatizado con reglas de entrada, salida y gestion de capital.",
  },
  {
    title: "Monitorea resultados en tiempo real",
    description: "Dashboard con metricas clave, historico y alertas instantaneas.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Ideal para empezar",
    icon: Wallet,
    features: ["1 estrategia activa", "Soporte comunitario", "Metricas basicas", "Paper trading"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    description: "Para traders serios",
    icon: Gem,
    features: ["5 estrategias activas", "Crypto + Forex", "Analytics avanzado", "Alertas premium"],
    highlighted: true,
  },
  {
    name: "VIP",
    price: "$199",
    description: "Maximo rendimiento",
    icon: Crown,
    features: ["Estrategias ilimitadas", "Senales institucionales", "Risk manager IA", "Soporte prioritario 1:1"],
    highlighted: false,
  },
];

// ---------------------------------------------------------------------------
// Animated Metric Counter with slow fluctuation every 60s
// ---------------------------------------------------------------------------

function AnimatedMetric({
  label,
  startValue,
  min,
  max,
  decimals,
  prefix = "",
  suffix = "",
}: {
  label: string;
  startValue: number;
  min: number;
  max: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(startValue);
  const [hasStarted, setHasStarted] = useState(false);

  // Mark as started when in view
  useEffect(() => {
    if (!inView || hasStarted) return;
    setHasStarted(true);
  }, [inView, hasStarted]);

  // Every 60 seconds, pick a new random value between min and max
  useEffect(() => {
    if (!hasStarted) return;

    const pickNewValue = () => {
      const range = max - min;
      const newVal = min + Math.random() * range;
      setValue(Number(newVal.toFixed(decimals)));
    };

    // Pick first value immediately after start
    pickNewValue();

    // Then every 60 seconds
    const interval = setInterval(pickNewValue, 60_000);

    return () => clearInterval(interval);
  }, [hasStarted, min, max, decimals]);

  return (
    <Card ref={ref} className="glass-panel border-emerald-500/20 bg-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-zinc-400">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.span
          className="text-4xl font-bold text-emerald-300 inline-block"
          animate={{
            textShadow: [
              "0 0 4px rgba(52,211,153,0.08)",
              "0 0 10px rgba(52,211,153,0.18)",
              "0 0 4px rgba(52,211,153,0.08)",
            ],
          }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        >
          {prefix}
          {value.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
          {suffix}
        </motion.span>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Animated Timeline Step
// ---------------------------------------------------------------------------

const stepVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: EASE,
    },
  }),
};

function TimelineStep({
  step,
  index,
  isActive,
}: {
  step: { title: string; description: string };
  index: number;
  isActive: boolean;
}) {
  return (
    <motion.div
      custom={index}
      variants={stepVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="relative pl-12"
    >
      {/* Timeline line */}
      {index < steps.length - 1 && (
        <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gradient-to-b from-[#3B82F6] to-[#1E3A5F]" />
      )}

      {/* Circle indicator */}
      <motion.div
        className={`absolute left-0 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
          isActive
            ? "border-violet-400 bg-violet-500/25 text-violet-200"
            : "border-white/20 bg-white/5 text-zinc-400"
        }`}
        animate={
          isActive
            ? {
                scale: [1, 1.15, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {index + 1}
      </motion.div>

      <Card className="glass-panel border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-xl">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-base text-zinc-300">{step.description}</CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Home() {
  const performanceRef = useRef<HTMLElement>(null);
  const performanceInView = useInView(performanceRef, { once: true, margin: "-50px" });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040406] text-white">
      {/* Particles background for Hero */}
      <ParticlesBackground />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(139,92,246,0.32),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.22),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(139,92,246,0.2),transparent_35%)]" />
      <main className="relative z-10 mx-auto max-w-6xl space-y-16 px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-32">
        {/* ── Hero Section ── */}
        <motion.section
          className="glass-panel space-y-8 rounded-3xl border border-white/10 px-6 py-10 sm:px-10"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <Badge className="border border-violet-400/40 bg-violet-500/10 text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.35)]">
            <Sparkles className="mr-2 h-4 w-4" />
            Plataforma Premium de Trading Automatizado
          </Badge>
          <div className="space-y-5">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="neon-gradient-text">TheMarketKilla</span>
            </h1>
            <p className="max-w-3xl text-xl text-zinc-300 sm:text-2xl">
              Trading automatizado de Crypto y Forex que realmente genera ganancias.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="group bg-gradient-to-r from-violet-500 to-emerald-400 px-8 text-lg font-semibold text-black transition hover:shadow-[0_0_28px_rgba(74,222,128,0.45)]">
              Empezar Gratis
              <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-base text-white hover:bg-white/10">
              Ver Performance Real
            </Button>
          </div>
        </motion.section>

        <MarketWidgets />

        {/* ── Estrategias Section with hover animations ── */}
        <section className="space-y-6" id="estrategias">
          <motion.h2
            className="text-3xl font-bold sm:text-4xl"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Estrategias Automatizadas
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strategies.map((strategy) => (
              <motion.div
                key={strategy.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, ease: EASE }}
                className="group relative"
              >
                {/* Gradient border pseudo-element */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.4))",
                    padding: "1px",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    borderRadius: "inherit",
                  }}
                />
                <Card
                  className={`glass-panel relative border bg-white/5 transition-all duration-300
                    group-hover:[-webkit-transform:translateY(-4px)_scale(1.02)]
                    group-hover:[transform:translateY(-4px)_scale(1.02)]
                    group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)]
                    border-white/10`}
                  style={{
                    transition:
                      "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <strategy.icon className="h-5 w-5 text-emerald-300" />
                      {strategy.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-base text-zinc-300">{strategy.description}</CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Performance Section ── */}
        <section ref={performanceRef} className="space-y-6" id="performance">
          <motion.h2
            className="text-3xl font-bold sm:text-4xl"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Performance Real
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricsConfig.map((metric) => (
              <AnimatedMetric key={metric.label} {...metric} />
            ))}
          </div>

          {/* Equity Curve Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          >
            <Card className="glass-panel border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-emerald-400/10">
              <CardHeader>
                <CardTitle className="text-xl">Equity Curve</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceInView ? (
                  <EquityChart />
                ) : (
                  <div className="h-64 w-full sm:h-72">
                    <Skeleton className="h-full w-full rounded-lg" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* ── Cómo Funciona (Timeline) ── */}
        <section className="space-y-6" id="como-funciona">
          <motion.h2
            className="text-3xl font-bold sm:text-4xl"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Como Funciona
          </motion.h2>
          <motion.div
            className="space-y-6 md:space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {steps.map((step, index) => (
              <TimelineStep
                key={step.title}
                step={step}
                index={index}
                isActive={true}
              />
            ))}
          </motion.div>
        </section>

        {/* ── Planes Section ── */}
        <section className="space-y-6" id="planes">
          <motion.h2
            className="text-3xl font-bold sm:text-4xl"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            Planes
          </motion.h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: EASE }}
                className="group relative"
              >
                <Card
                  className={`glass-panel relative border bg-white/5 transition-all duration-300
                    group-hover:[-webkit-transform:translateY(-4px)_scale(1.02)]
                    group-hover:[transform:translateY(-4px)_scale(1.02)]
                    group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)]
                    ${plan.highlighted
                      ? "border-violet-400/60 pt-7 shadow-[0_0_35px_rgba(139,92,246,0.35)] group-hover:shadow-[0_24px_52px_rgba(139,92,246,0.45)]"
                      : "border-white/10"
                    }`}
                  style={{
                    transition:
                      "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {plan.highlighted && (
                    <>
                      {/* Pro card animated gradient border */}
                      <div
                        className="pointer-events-none absolute -inset-[1px] rounded-xl opacity-60"
                        style={{
                          background:
                            "conic-gradient(from 0deg, #3B82F6, #8B5CF6, #3B82F6, #8B5CF6, #3B82F6)",
                          WebkitMask:
                            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                          WebkitMaskComposite: "xor",
                          maskComposite: "exclude",
                          padding: "1px",
                          animation: "rotate-gradient 4s linear infinite",
                        }}
                      />
                      <Badge className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-400 px-4 py-1 text-sm font-semibold text-black shadow-lg shadow-emerald-400/30 whitespace-nowrap z-20">
                        🔥 Mas Popular
                      </Badge>
                    </>
                  )}
                  <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center justify-between text-3xl">
                      {plan.name}
                      <plan.icon className="h-5 w-5 text-emerald-300" />
                    </CardTitle>
                    <div className="text-5xl font-extrabold">
                      {plan.price}
                      <span className="text-base font-medium text-zinc-400">/mes</span>
                    </div>
                    <p className="text-base text-zinc-400">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-base text-zinc-300">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full bg-white/10 text-base text-white hover:bg-white/20">
                      Elegir {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Testimonials Carousel ── */}
        <TestimonialCarousel />
      </main>

      <footer className="relative z-10 mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <Separator className="bg-white/10" />
        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm text-zinc-400 sm:flex-row">
          <p>(c) {new Date().getFullYear()} TheMarketKilla. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a className="transition hover:text-violet-300" href="https://t.me" target="_blank" rel="noreferrer">
              Telegram
            </a>
            <a className="transition hover:text-violet-300" href="https://x.com" target="_blank" rel="noreferrer">
              X
            </a>
            <a className="transition hover:text-violet-300" href="https://discord.com" target="_blank" rel="noreferrer">
              Discord
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
