"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Maximize2 } from "lucide-react";
import { ChartModal } from "@/components/chart-modal";
import { CardGroup, CardItem } from "@/components/card-group";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

type AssetKey = "BTCUSDT" | "ETHUSDT" | "XRPUSDT" | "XAUTUSDT";

type AssetConfig = {
  id: AssetKey;
  symbol: string;
  label: string;
  displayDecimals: number;
};

type AssetData = {
  price: number;
  change24h: number;
  sparkline: number[];
};

const ASSETS: AssetConfig[] = [
  { id: "BTCUSDT", symbol: "BTC", label: "Bitcoin", displayDecimals: 0 },
  { id: "ETHUSDT", symbol: "ETH", label: "Ethereum", displayDecimals: 0 },
  { id: "XRPUSDT", symbol: "XRP", label: "XRP", displayDecimals: 4 },
  { id: "XAUTUSDT", symbol: "XAU/USD", label: "Oro (PAXG)", displayDecimals: 2 },
];

const SPARKLINE_POINTS = 48;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(value: number, decimals: number) {
  if (decimals === 4) return `$${value.toFixed(4)}`;
  if (value >= 1000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: decimals })}`;
  return `$${value.toFixed(decimals)}`;
}

function formatChange(change: number | null) {
  if (change === null || Number.isNaN(change)) return "0.00%";
  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
}

// ---------------------------------------------------------------------------
// Binance REST helpers
// ---------------------------------------------------------------------------

const BINANCE_REST = "https://api.binance.com";

async function fetchInitialPrices(): Promise<Record<AssetKey, number>> {
  const entries = await Promise.all(
    ASSETS.map(async (asset) => {
      try {
        const res = await fetch(`${BINANCE_REST}/api/v3/ticker/price?symbol=${asset.id}`, {
          cache: "no-store",
        });
        if (!res.ok) return { symbol: asset.id, price: 0 };
        const data: { symbol: string; price: string } = await res.json();
        return { symbol: asset.id, price: Number.parseFloat(data.price) };
      } catch {
        return { symbol: asset.id, price: 0 };
      }
    }),
  );
  const map: Record<string, number> = {};
  for (const entry of entries) {
    map[entry.symbol] = entry.price;
  }
  return map as Record<AssetKey, number>;
}

async function fetch24hChanges(): Promise<Record<AssetKey, number>> {
  const entries = await Promise.all(
    ASSETS.map(async (asset) => {
      try {
        const res = await fetch(`${BINANCE_REST}/api/v3/ticker/24hr?symbol=${asset.id}`, {
          cache: "no-store",
        });
        if (!res.ok) return { symbol: asset.id, change: 0 };
        const data: { symbol: string; priceChangePercent: string } = await res.json();
        return { symbol: asset.id, change: Number.parseFloat(data.priceChangePercent) };
      } catch {
        return { symbol: asset.id, change: 0 };
      }
    }),
  );
  const map: Record<string, number> = {};
  for (const entry of entries) {
    map[entry.symbol] = entry.change;
  }
  return map as Record<AssetKey, number>;
}

async function fetchSparkline(symbol: AssetKey): Promise<number[]> {
  try {
    const res = await fetch(
      `${BINANCE_REST}/api/v3/klines?symbol=${symbol}&interval=5m&limit=${SPARKLINE_POINTS}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data: [number, string, string, string, string][] = await res.json();
    return data.map((k) => Number.parseFloat(k[4]));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// WebSocket hook
// ---------------------------------------------------------------------------

function useBinanceWebSocket(onMessage: (symbol: AssetKey, price: number) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const streams = ASSETS.map((a) => `${a.id.toLowerCase()}@trade`).join("/");
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🔌 Binance WS connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.e === "trade" && msg.s) {
          const symbol = msg.s as AssetKey;
          const price = Number.parseFloat(msg.p);
          if (ASSETS.some((a) => a.id === symbol) && !Number.isNaN(price)) {
            onMessageRef.current(symbol, price);
          }
        }
      } catch {
        // ignore
      }
    };

    ws.onerror = () => {
      console.warn("⚠️ Binance WS error");
    };

    ws.onclose = () => {
      console.log("🔌 Binance WS disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MarketWidgets() {
  const [assets, setAssets] = useState<Record<AssetKey, AssetData> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<AssetConfig | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [prices, changes24h, btcSpark, ethSpark, xrpSpark, xauSpark] = await Promise.all([
          fetchInitialPrices(),
          fetch24hChanges(),
          fetchSparkline("BTCUSDT"),
          fetchSparkline("ETHUSDT"),
          fetchSparkline("XRPUSDT"),
          fetchSparkline("XAUTUSDT"),
        ]);

        if (!mounted) return;

        const sparklines: Record<AssetKey, number[]> = {
          BTCUSDT: btcSpark,
          ETHUSDT: ethSpark,
          XRPUSDT: xrpSpark,
          XAUTUSDT: xauSpark,
        };

        const mapped = {} as Record<AssetKey, AssetData>;
        for (const asset of ASSETS) {
          mapped[asset.id] = {
            price: prices[asset.id] ?? 0,
            change24h: changes24h[asset.id] ?? 0,
            sparkline: sparklines[asset.id] ?? [],
          };
        }

        setAssets(mapped);
        setLastUpdated(
          new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        );
      } catch {
        // Silent fail
      }
    };

    load();
    const interval = setInterval(load, 60_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleWsMessage = useCallback((symbol: AssetKey, price: number) => {
    setAssets((prev) => {
      if (!prev?.[symbol]) return prev;
      return {
        ...prev,
        [symbol]: { ...prev[symbol], price },
      };
    });
    setLastUpdated(
      new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    );
  }, []);

  useBinanceWebSocket(handleWsMessage);

  const snapshotCards = useMemo(() => {
    return ASSETS.map((asset) => {
      const live = assets?.[asset.id];
      const change = live?.change24h ?? 0;
      const prices = live?.sparkline ?? [];
      const isPositive = change >= 0;
      const lineColor = isPositive ? "rgba(52, 211, 153, 1)" : "rgba(248, 113, 113, 1)";
      const lineBackground = isPositive ? "rgba(52, 211, 153, 0.15)" : "rgba(248, 113, 113, 0.15)";

      return {
        ...asset,
        price: live?.price ?? 0,
        change,
        chartData: {
          labels: prices.map((_, i) => i),
          datasets: [
            {
              data: prices.length > 0 ? prices : Array.from({ length: 24 }, () => 0),
              borderColor: lineColor,
              backgroundColor: lineBackground,
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.35,
              fill: true,
            },
          ],
        },
      };
    });
  }, [assets]);

  const handleCloseModal = useCallback(() => {
    setSelectedAsset(null);
  }, []);

  return (
    <>
      {/* ── Top ticker bar ── */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#040406]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
          {ASSETS.map((asset) => {
            const live = assets?.[asset.id];
            const change = live?.change24h ?? 0;
            const isPositive = change >= 0;

            return (
              <div key={asset.id} className="flex items-center gap-2">
                <span className="font-semibold text-zinc-200">{asset.symbol}</span>
                <span className="text-zinc-300">
                  {live ? formatPrice(live.price, asset.displayDecimals) : "--"}
                </span>
                <span className={isPositive ? "text-emerald-300" : "text-red-300"}>
                  {formatChange(change)}
                </span>
              </div>
            );
          })}
          <div className="ml-auto hidden text-xs text-zinc-400 sm:block">
            Actualizado: {lastUpdated || "--:--:--"}
          </div>
        </div>
      </div>

      {/* ── Market Snapshot section ── */}
      <section className="space-y-6" id="market-snapshot">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-3xl font-bold sm:text-4xl">Market Snapshot</h2>
          <Badge className="border border-emerald-400/40 bg-emerald-500/10 text-emerald-200">
            Tiempo Real · Binance
          </Badge>
        </div>

        <CardGroup className="marquee-fade relative overflow-hidden rounded-2xl py-4">
          <div className="marquee-track flex w-max gap-4 sm:gap-5">
            {[...snapshotCards, ...snapshotCards].map((asset, index) => {
              const isPositive = asset.change >= 0;
              // Distribuir posiciones para efecto abanico (solo en el primer set)
              const positions: ("left" | "center" | "right")[] = ["left", "left", "right", "right"];

              return (
                <CardItem key={`${asset.id}-${index}`} position={positions[index % 4]}>
                  <Card
                    onClick={() => setSelectedAsset(asset)}
                    className="glass-panel min-w-[260px] cursor-pointer border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-violet-400/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.25)] sm:min-w-[280px] group"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-xl">
                        <span>{asset.symbol}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-400">{asset.label}</span>
                          <Maximize2 className="h-3.5 w-3.5 text-zinc-500 opacity-0 transition group-hover:opacity-100" />
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-extrabold text-zinc-100">
                        {assets?.[asset.id]
                          ? formatPrice(asset.price, asset.displayDecimals)
                          : "--"}
                      </div>
                      <div
                        className={`text-sm font-semibold ${isPositive ? "text-emerald-300" : "text-red-300"}`}
                      >
                        {formatChange(asset.change)} (24h)
                      </div>
                      <div className="h-20 w-full">
                        <Line
                          data={asset.chartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: false,
                            plugins: { legend: { display: false }, tooltip: { enabled: false } },
                            scales: { x: { display: false }, y: { display: false } },
                            elements: { line: { capBezierPoints: true } },
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CardItem>
              );
            })}
          </div>
        </CardGroup>
      </section>

      {/* ── Interactive Chart Modal ── */}
      {selectedAsset && (
        <ChartModal
          symbol={selectedAsset.id}
          label={selectedAsset.label}
          displayDecimals={selectedAsset.displayDecimals}
          currentPrice={assets?.[selectedAsset.id]?.price ?? 0}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
