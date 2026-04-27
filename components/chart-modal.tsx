"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
  Tooltip,
  Filler,
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TimeframeKey = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

type TimeframeConfig = {
  key: TimeframeKey;
  label: string;
  interval: string;
  limit: number;
};

const TIMEFRAMES: TimeframeConfig[] = [
  { key: "1m", label: "1m", interval: "1m", limit: 60 },
  { key: "5m", label: "5m", interval: "5m", limit: 48 },
  { key: "15m", label: "15m", interval: "15m", limit: 48 },
  { key: "1h", label: "1h", interval: "1h", limit: 48 },
  { key: "4h", label: "4h", interval: "4h", limit: 48 },
  { key: "1d", label: "1d", interval: "1d", limit: 30 },
];

// ---------------------------------------------------------------------------
// Binance REST helpers
// ---------------------------------------------------------------------------

const BINANCE_REST = "https://api.binance.com";

type Kline = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

async function fetchKlines(
  symbol: string,
  interval: string,
  limit: number,
): Promise<Kline[]> {
  try {
    const res = await fetch(
      `${BINANCE_REST}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data: [number, string, string, string, string, string, string, string, string, string, string, string][] =
      await res.json();
    return data.map((k) => ({
      time: k[0],
      open: Number.parseFloat(k[1]),
      high: Number.parseFloat(k[2]),
      low: Number.parseFloat(k[3]),
      close: Number.parseFloat(k[4]),
      volume: Number.parseFloat(k[5]),
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(value: number, decimals: number) {
  if (decimals === 4) return `$${value.toFixed(4)}`;
  if (value >= 1000)
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: decimals })}`;
  return `$${value.toFixed(decimals)}`;
}

function formatTime(timestamp: number, interval: string): string {
  const d = new Date(timestamp);
  if (interval === "1d") {
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  }
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Modal Component
// ---------------------------------------------------------------------------

type ChartModalProps = {
  symbol: string;
  label: string;
  displayDecimals: number;
  currentPrice: number;
  onClose: () => void;
};

export function ChartModal({
  symbol,
  label,
  displayDecimals,
  currentPrice,
  onClose,
}: ChartModalProps) {
  const [timeframe, setTimeframe] = useState<TimeframeKey>("5m");
  const [klines, setKlines] = useState<Kline[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsPrice, setWsPrice] = useState<number>(currentPrice);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch klines on timeframe change
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const tfConfig = TIMEFRAMES.find((t) => t.key === timeframe)!;

    fetchKlines(symbol, tfConfig.interval, tfConfig.limit).then((data) => {
      if (!mounted) return;
      setKlines(data);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [symbol, timeframe]);

  // WebSocket for real-time price
  useEffect(() => {
    const stream = `${symbol.toLowerCase()}@trade`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.e === "trade" && msg.p) {
          setWsPrice(Number.parseFloat(msg.p));
        }
      } catch {
        // ignore
      }
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  // Compute chart data
  const chartData = useMemo(() => {
    if (klines.length === 0) return null;

    const tfConfig = TIMEFRAMES.find((t) => t.key === timeframe)!;

    const closes = klines.map((k) => k.close);
    const times = klines.map((k) => k.time);

    const firstClose = klines[0]?.close ?? 0;
    const lastClose = klines[klines.length - 1]?.close ?? 0;
    const isUp = lastClose >= firstClose;
    const lineColor = isUp ? "rgba(52, 211, 153, 1)" : "rgba(248, 113, 113, 1)";
    const fillColor = isUp
      ? "rgba(52, 211, 153, 0.12)"
      : "rgba(248, 113, 113, 0.12)";

    return {
      labels: times,
      isUp,
      lineColor,
      datasets: [
        {
          data: closes.map((c, i) => ({ x: times[i], y: c })),
          borderColor: lineColor,
          backgroundColor: fillColor,
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 10,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [klines, timeframe]);

  const tfConfig = TIMEFRAMES.find((t) => t.key === timeframe)!;
  const klineOpen = klines[0]?.open ?? 0;
  const klineHigh = klines.reduce((max, k) => Math.max(max, k.high), 0);
  const klineLow = klines.reduce((min, k) => Math.min(min, k.low), Infinity);
  const klineVolume = klines.reduce((sum, k) => sum + k.volume, 0);
  const changePercent =
    klines.length >= 2
      ? ((wsPrice - klines[0].open) / klines[0].open) * 100
      : 0;
  const isPositive = changePercent >= 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#040406] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{symbol}</h3>
              <p className="text-sm text-zinc-400">{label}</p>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-2xl font-extrabold text-white">
                {formatPrice(wsPrice, displayDecimals)}
              </span>
              <Badge
                className={
                  isPositive
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                    : "border-red-400/40 bg-red-500/10 text-red-200"
                }
              >
                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-zinc-300 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Timeframe selector ── */}
        <div className="flex items-center gap-2 overflow-x-auto px-6 py-3">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                timeframe === tf.key
                  ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/40"
                  : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* ── Chart ── */}
        <div className="px-6 pb-2">
          {loading ? (
            <div className="flex h-[320px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-300" />
            </div>
          ) : chartData ? (
            <div className="h-[320px] w-full">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: { duration: 300 },
                  interaction: {
                    intersect: false,
                    mode: "index",
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: true,
                      backgroundColor: "rgba(4, 4, 6, 0.9)",
                      titleColor: "#a78bfa",
                      bodyColor: "#f5f5f7",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderWidth: 1,
                      padding: 12,
                      cornerRadius: 8,
                      displayColors: false,
                      callbacks: {
                        title: (items) => {
                          if (items[0]?.parsed?.x != null) {
                            return formatTime(
                              items[0].parsed.x as number,
                              tfConfig.interval,
                            );
                          }
                          return "";
                        },
                        label: (context) => {
                          return `$${Number(context.parsed.y).toLocaleString("en-US", {
                            minimumFractionDigits: displayDecimals,
                            maximumFractionDigits: displayDecimals,
                          })}`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      type: "time",
                      time: {
                        unit: tfConfig.interval === "1d" ? "day" : tfConfig.interval === "1h" || tfConfig.interval === "4h" ? "hour" : "minute",
                        displayFormats: {
                          minute: "HH:mm",
                          hour: "HH:mm",
                          day: "dd MMM",
                        },
                      },
                      grid: {
                        color: "rgba(255,255,255,0.04)",
                      },
                      ticks: {
                        color: "rgba(255,255,255,0.35)",
                        maxTicksLimit: 10,
                        font: { size: 11 },
                      },
                      border: {
                        color: "rgba(255,255,255,0.08)",
                      },
                    },
                    y: {
                      position: "right",
                      grid: {
                        color: "rgba(255,255,255,0.04)",
                      },
                      ticks: {
                        color: "rgba(255,255,255,0.35)",
                        font: { size: 11 },
                        callback: (value) =>
                          `$${Number(value).toLocaleString("en-US", {
                            minimumFractionDigits: displayDecimals,
                            maximumFractionDigits: displayDecimals,
                          })}`,
                      },
                      border: {
                        color: "rgba(255,255,255,0.08)",
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-zinc-500">
              No hay datos disponibles
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        {!loading && klines.length > 0 && (
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 px-6 py-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-zinc-500">Apertura</p>
              <p className="text-sm font-semibold text-zinc-200">
                {formatPrice(klineOpen, displayDecimals)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Máximo</p>
              <p className="text-sm font-semibold text-emerald-300">
                {formatPrice(klineHigh, displayDecimals)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Mínimo</p>
              <p className="text-sm font-semibold text-red-300">
                {formatPrice(klineLow, displayDecimals)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Volumen</p>
              <p className="text-sm font-semibold text-zinc-200">
                {klineVolume > 1000
                  ? `${(klineVolume / 1000).toFixed(1)}K`
                  : klineVolume.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
