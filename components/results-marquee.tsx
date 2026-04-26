import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

type VerifiedResult = {
  user: string;
  winrate: string;
  profit: string;
  drawdown: string;
  comment: string;
};

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

function ResultCard({ result }: { result: VerifiedResult }) {
  return (
    <Card className="glass-panel min-w-[280px] border-white/10 bg-white/5 sm:min-w-[320px]">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-zinc-100">{result.user}</p>
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

export function ResultsMarquee() {
  return (
    <section className="space-y-6" id="resultados-verificados">
      <h2 className="text-3xl font-bold sm:text-4xl">Resultados Verificados</h2>
      <div className="marquee-fade relative overflow-hidden rounded-2xl">
        <div className="marquee-track flex w-max gap-4 sm:gap-5">
          {[...verifiedResults, ...verifiedResults].map((result, index) => (
            <ResultCard key={`${result.user}-${index}`} result={result} />
          ))}
        </div>
      </div>
    </section>
  );
}
