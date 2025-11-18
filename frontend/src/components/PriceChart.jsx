// frontend/src/components/PriceChart.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function PriceChart({
  historical_dates = [],
  historical_prices = [],
  prediction_dates = [],
  predictions = [],
}) {
  // Build labels and aligned arrays
  const labels = [...(historical_dates || []), ...(prediction_dates || [])];
  const histSet = [...(historical_prices || []), ...new Array(prediction_dates?.length || 0).fill(null)];
  const predSet = [...new Array(historical_dates?.length || 0).fill(null), ...(predictions || [])];

  // Dark mode detection (if your app uses class-based dark mode on <html>)
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  // Theme-aware colors
  const colors = {
    text: isDark ? "#E6EEF8" : "#0F172A",
    grid: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.06)",
    panelBg: isDark ? "#071226" : "#ffffff",
    historicalLine: isDark ? "#9CA3AF" : "#111827",
    predictedLine: isDark ? "#C084FC" : "#4F46E5",
    historicalFill: isDark ? "rgba(156,163,175,0.04)" : "rgba(17,24,39,0.04)",
    predictedFill: isDark ? "rgba(192,132,252,0.06)" : "rgba(79,70,229,0.06)",
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Historical",
        data: histSet,
        tension: 0.22,
        borderColor: colors.historicalLine,
        borderWidth: 2,
        backgroundColor: colors.historicalFill,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.historicalLine,
        pointBorderColor: colors.historicalLine,
        spanGaps: true,
        fill: true,
      },
      {
        label: "Predicted",
        data: predSet,
        tension: 0.28,
        borderColor: colors.predictedLine,
        borderWidth: 3,
        backgroundColor: colors.predictedFill,
        borderDash: [6, 6],
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.panelBg,
        pointBorderColor: colors.predictedLine,
        spanGaps: true,
        fill: false,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false, // important so the chart uses the parent's height (e.g. h-64)
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: colors.text,
          usePointStyle: true,
          boxWidth: 10,
          padding: 12,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDark ? "#081427" : "#fff",
        titleColor: colors.text,
        bodyColor: isDark ? "#e6eef8" : "#0f172a",
        borderColor: colors.grid,
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed?.y;
            if (v == null) return `${ctx.dataset.label}: —`;
            return `${ctx.dataset.label}: $${Number(v).toFixed(2)}`;
          },
        },
      },
      title: { display: false },
    },
    scales: {
      x: {
        type: "category",
        ticks: {
          color: colors.text,
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 8,
        },
        grid: {
          color: colors.grid,
        },
      },
      y: {
        ticks: {
          color: colors.text,
          callback: (value) => `$${Number(value).toFixed(0)}`,
        },
        grid: {
          color: colors.grid,
        },
        beginAtZero: false,
      },
    },
    layout: {
      padding: { top: 6, right: 8, bottom: 6, left: 6 },
    },
  };

  // If no data, show placeholder
  if (!labels || labels.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Price Chart</h4>
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">No chart data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Price Chart</h4>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
