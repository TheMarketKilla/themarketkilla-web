import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketWidgets } from "@/components/market-widgets";
import { ResultsMarquee } from "@/components/results-marquee";
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

const metrics = [
  { label: "Winrate", value: "73.4%" },
  { label: "Profit Factor", value: "2.41" },
  { label: "Max Drawdown", value: "8.7%" },
  { label: "Trades Mensuales", value: "320+" },
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

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040406] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(139,92,246,0.32),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.22),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(139,92,246,0.2),transparent_35%)]" />
      <main className="relative z-10 mx-auto max-w-6xl space-y-16 px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-32">
        <section className="glass-panel animate-fade-up space-y-8 rounded-3xl border border-white/10 px-6 py-10 sm:px-10">
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
        </section>

        <MarketWidgets />

        <section className="space-y-6" id="estrategias">
          <h2 className="text-3xl font-bold sm:text-4xl">Estrategias Automatizadas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strategies.map((strategy) => (
              <Card key={strategy.title} className="glass-panel border-white/10 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <strategy.icon className="h-5 w-5 text-emerald-300" />
                    {strategy.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-zinc-300">{strategy.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6" id="performance">
          <h2 className="text-3xl font-bold sm:text-4xl">Performance Real</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label} className="glass-panel border-emerald-500/20 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-zinc-400">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-4xl font-bold text-emerald-300">{metric.value}</CardContent>
              </Card>
            ))}
          </div>
          <Card className="glass-panel border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-emerald-400/10">
            <CardHeader>
              <CardTitle className="text-xl">Equity Curve (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52 rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="h-full w-full rounded-lg bg-[linear-gradient(110deg,rgba(16,185,129,0.1)_0%,rgba(139,92,246,0.2)_40%,rgba(16,185,129,0.1)_100%)]" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6" id="como-funciona">
          <h2 className="text-3xl font-bold sm:text-4xl">Como Funciona</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => (
              <Card key={step.title} className="glass-panel border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/25 text-base font-semibold text-violet-200">
                      {index + 1}
                    </span>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-zinc-300">{step.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6" id="planes">
          <h2 className="text-3xl font-bold sm:text-4xl">Planes</h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`glass-panel relative border bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-[0_18px_46px_rgba(139,92,246,0.3)] ${plan.highlighted ? "border-violet-400/60 pt-7 shadow-[0_0_35px_rgba(139,92,246,0.35)] hover:shadow-[0_24px_52px_rgba(139,92,246,0.45)]" : "border-white/10"}`}
              >
                {plan.highlighted && (
                  <Badge className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-400 px-4 py-1 text-sm font-semibold text-black shadow-lg shadow-emerald-400/30 whitespace-nowrap z-10">
                    🔥 Mas Popular
                  </Badge>
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
            ))}
          </div>
        </section>

        <ResultsMarquee />

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
