"use client";

import { useInView } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
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

// ---------------------------------------------------------------------------
// Generate synthetic equity curve data (30 points)
// ---------------------------------------------------------------------------

function generateEquityData(): { date: string; equity: number; drawdown: number }[] {
  const data: { date: string; equity: number; drawdown: number }[] = [];
  let value = 10000;
  let peak = 10000;
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate realistic growth with some noise
    const change = (Math.random() - 0.35) * 400; // biased upward
    value = Math.max(value + change, value * 0.85); // prevent catastrophic drops

    if (value > peak) peak = value;
    const drawdown = ((value - peak) / peak) * 100;

    data.push({
      date: date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
      equity: Math.round(value),
      drawdown: Math.round(drawdown * 10) / 10,
    });
  }

  return data;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EquityChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true, margin: "-100px" });
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    equity: number;
    drawdown: number;
  } | null>(null);

  const equityData = useMemo(() => generateEquityData(), []);

  const chartData = useMemo(
    () => ({
      labels: equityData.map((d) => d.date),
      datasets: [
        {
          data: equityData.map((d) => d.equity),
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D } }) => {
            const chartCtx = ctx.chart.ctx;
            const gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(59, 130, 246, 0.15)");
            gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.08)");
            gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 15,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#8B5CF6",
          pointHoverBorderColor: "rgba(139, 92, 246, 0.6)",
          pointHoverBorderWidth: 3,
          tension: 0.35,
          fill: true,
        },
      ],
    }),
    [equityData],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: inView ? 2000 : 0,
        easing: "easeOutQuart" as const,
      },
      interaction: {
        intersect: false,
        mode: "index" as const,
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
            title: (items: { label: string }[]) => (items[0]?.label as string) ?? "",
            label: (context: { parsed: { y?: number | null }; dataIndex: number }) => {
              const point = equityData[context.dataIndex];
              const yVal = context.parsed.y ?? 0;
              return [
                `Equity: $${yVal.toLocaleString("en-US")}`,
                `Drawdown: ${point?.drawdown ?? 0}%`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: {
            color: "rgba(255,255,255,0.25)",
            maxTicksLimit: 10,
            font: { size: 10 },
          },
          border: { color: "rgba(255,255,255,0.08)" },
        },
        y: {
          display: true,
          position: "right" as const,
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: {
            color: "rgba(255,255,255,0.25)",
            font: { size: 10 },
            callback: (value: string | number) => `$${(Number(value) / 1000).toFixed(0)}K`,
          },
          border: { color: "rgba(255,255,255,0.08)" },
        },
      },
    }),
    [inView, equityData],
  );

  return (
    <div ref={chartRef} className="relative">
      <div className="h-64 w-full sm:h-72">
        {inView ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full w-full rounded-lg bg-white/[0.03] animate-pulse" />
        )}
      </div>
      {hoveredPoint && (
        <div className="absolute top-3 left-3 rounded-lg border border-white/10 bg-[#040406]/90 px-3 py-2 text-xs text-zinc-300 shadow-xl backdrop-blur-md">
          <p className="font-semibold text-violet-200">{hoveredPoint.date}</p>
          <p>${hoveredPoint.equity.toLocaleString("en-US")}</p>
          <p className="text-red-300">{hoveredPoint.drawdown}% drawdown</p>
        </div>
      )}
    </div>
  );
}
