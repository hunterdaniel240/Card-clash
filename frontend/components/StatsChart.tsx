"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface PlayerStats {
  playerId: string;
  chartLabel: string;
  score: number;
  accuracy: number;
  gamesPlayed: number;
  avgResponseTime: number;
}

interface StatsChartProps {
  data: PlayerStats[];
  type: "scores" | "accuracy";
  height?: number;
}

export default function StatsChart({
  data,
  type,
  height = 400,
}: StatsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const labels = data.map((stat) => stat.chartLabel);
    const values = data.map((stat) =>
      type === "scores" ? stat.score : stat.accuracy,
    );

    const colors =
      type === "scores"
        ? "rgb(34, 197, 94)" // green
        : "rgb(59, 130, 246)"; // blue

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: type === "scores" ? "Score" : "Accuracy (%)",
            data: values,
            backgroundColor: colors,
            borderColor: "rgb(0, 0, 0)",
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: {
              font: { size: 14, weight: "bold" },
              color: "rgb(0, 0, 0)",
            },
          },
        },
        scales: {
          y: {
            ticks: { font: { size: 12, weight: "bold" } },
            grid: { color: "rgba(0, 0, 0, 0.1)" },
            max: type === "accuracy" ? 100 : undefined,
          },
          x: {
            ticks: { font: { size: 12, weight: "bold" } },
            grid: { color: "rgba(0, 0, 0, 0.1)" },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}
