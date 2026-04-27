"use client";

import { useEffect, useMemo, useState } from "react";
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

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

type AssetKey = "bitcoin" | "ethereum" | "ripple" | "pax-gold";

type AssetConfig = {
  id: AssetKey;
  symbol: string;
  label: string;
};

type CoinGeckoAsset = {
  id: AssetKey;
  current_price: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: {
    price: number[];
  };
};

const ASSETS: AssetConfig[] = [
  { id: "bitcoin", symbol: "BTC", label: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", label: "Ethereum" },
  { id: "ripple", symbol: "XRP", label: "XRP" },
  { id: "pax-gold", symbol: "XAU/USD", label: "Oro (PAXG)" },
];

const FETCH_INTERVAL_MS = 20000;

function formatPrice(value: number, isXrp: boolean) {
  if (isXrp) return `$${value.toFixed(4)}`;
  if (value >= 1000) return `$${value.toLocaleString()}`;
  return `$${value.toFixed(2)}`;
}

function formatChange(change: number | null) {
  if (change === null || Number.isNaN(change)) return "0.00%";
  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
}

export function MarketWidgets() {
  const [assets, setAssets] = useState<Record<AssetKey, CoinGeckoAsset> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const loadMarketData = async () => {
      try {
        const ids = ASSETS.map((asset) => asset.id).join(",");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`,
          { cache: "no-store" },
        );
        if (!response.ok) return;

        const payload = (await response.json()) as CoinGeckoAsset[];
        if (!mounted) return;

        const mapped = payload.reduce(
          (accumulator, coin) => {
            accumulator[coin.id] = coin;
            return accumulator;
          },
          {} as Record<AssetKey, CoinGeckoAsset>,
        );

        setAssets(mapped);
        setLastUpdated(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } catch {
        // Silent fail to avoid UI disruption on rate-limit/intermittent API errors.
      }
    };

    loadMarketData();
    const interval = setInterval(loadMarketData, FETCH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const snapshotCards = useMemo(() => {
    return ASSETS.map((asset) => {
      const live = assets?.[asset.id];
      const change = live?.price_change_percentage_24h ?? 0;
      const prices = live?.sparkline_in_7d?.price ?? [];
      const isPositive = change >= 0;
      const lineColor = isPositive ? "rgba(52, 211, 153, 1)" : "rgba(248, 113, 113, 1)";
      const lineBackground = isPositive ? "rgba(52, 211, 153, 0.15)" : "rgba(248, 113, 113, 0.15)";

      return {
        ...asset,
        price: live?.current_price ?? 0,
        change,
        chartData: {
          labels: prices.map((_, index) => index),
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

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#040406]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
          {ASSETS.map((asset) => {
            const live = assets?.[asset.id];
            const change = live?.price_change_percentage_24h ?? 0;
            const isPositive = change >= 0;

            return (
              <div key={asset.id} className="flex items-center gap-2">
                <span className="font-semibold text-zinc-200">{asset.symbol}</span>
                <span className="text-zinc-300">
                  {live ? formatPrice(live.current_price, asset.id === "ripple") : "--"}
                </span>
                <span className={isPositive ? "text-emerald-300" : "text-red-300"}>{formatChange(change)}</span>
              </div>
            );
          })}
          <div className="ml-auto hidden text-xs text-zinc-400 sm:block">Actualizado: {lastUpdated || "--:--:--"}</div>
        </div>
      </div>

      <section className="space-y-6" id="market-snapshot">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-3xl font-bold sm:text-4xl">Market Snapshot</h2>
          <Badge className="border border-violet-400/40 bg-violet-500/10 text-violet-200">Live cada 20s</Badge>
        </div>

        <div className="marquee-fade relative overflow-hidden rounded-2xl py-4">
          <div className="marquee-track flex w-max gap-4 sm:gap-5">
            {[...snapshotCards, ...snapshotCards].map((asset, index) => {
              const isPositive = asset.change >= 0;

              return (
                <Card key={`${asset.id}-${index}`} className="glass-panel min-w-[260px] border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-violet-400/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.25)] sm:min-w-[280px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-xl">
                      <span>{asset.symbol}</span>
                      <span className="text-sm font-medium text-zinc-400">{asset.label}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-extrabold text-zinc-100">
                      {assets?.[asset.id] ? formatPrice(asset.price, asset.id === "ripple") : "--"}
                    </div>
                    <div className={`text-sm font-semibold ${isPositive ? "text-emerald-300" : "text-red-300"}`}>
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
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
