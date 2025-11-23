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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PriceChart({
  historical_dates = [],
  historical_prices = [],
  prediction_dates = [],
  predictions = [],
  showHistorical = true,
  showPredicted = true,
}) {
  // --- 1. FILTERING LOGIC (New Feature) ---
  const filteredPredDates = [];
  const filteredPredPrices = [];

  if (predictions && prediction_dates) {
    predictions.forEach((price, index) => {
      // Rule 1: Skip the first 2 points immediately
      if (index < 2) return;

      // Rule 2: Skip 2 points after every 5 points
      // We offset by 2 because we already skipped indices 0 and 1.
      const adjustedIndex = index - 2;
      const cyclePosition = adjustedIndex % 7; // Cycle length = 5 (keep) + 2 (skip) = 7

      // If position is 0-4, we keep. If 5-6, we skip.
      if (cyclePosition < 5) {
        filteredPredPrices.push(price);
        // Safely push the corresponding date if it exists
        if (prediction_dates[index]) {
          filteredPredDates.push(prediction_dates[index]);
        }
      }
    });
  }

  // --- 2. Create Unified Labels using Filtered Data ---
  const labels = [...(historical_dates || []), ...filteredPredDates];

  // --- 3. Identify the "Bridge Price" (Last historical price) ---
  const lastHistPrice =
    historical_prices.length > 0
      ? historical_prices[historical_prices.length - 1]
      : null;

  // --- 4. Construct Historical Dataset ---
  const histSet = [
    ...(historical_prices || []),
    ...new Array(filteredPredDates.length).fill(null),
  ];

  // --- 5. Construct Predicted Dataset ---
  let predSet = [];
  if (historical_dates.length > 0) {
    // Pad nulls for history (minus the last one for the bridge)
    const nullPadding = new Array(historical_dates.length - 1).fill(null);
    // Connect Bridge -> Filtered Predictions
    predSet = [...nullPadding, lastHistPrice, ...filteredPredPrices];
  } else {
    predSet = [...filteredPredPrices];
  }

  const isDark = true;

  const colors = {
    text: "#FFFFFF",
    grid: "rgba(255,255,255,0.15)",
    panelBg: "transparent",
    historicalLine: "#A78BFA",
    predictedLine: "#10B981",
    historicalFill: "rgba(167,139,250,0.1)",
    predictedFill: "rgba(16,185,129,0.08)",
    pointBgDark: "#1E293B",
    pointBorderDark: "#E6EEF8",
  };

  const datasets = [];

  if (showHistorical) {
    datasets.push({
      label: "Historical",
      data: histSet,
      tension: 0.35,
      borderColor: colors.historicalLine,
      borderWidth: 3,
      backgroundColor: colors.historicalFill,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: colors.pointBgDark,
      pointBorderColor: colors.historicalLine,
      pointBorderWidth: 2,
      spanGaps: true,
      fill: "start",
    });
  }

  if (showPredicted) {
    datasets.push({
      label: "Predicted",
      data: predSet,
      tension: 0.35, // Smooths the connection over the skipped points
      borderColor: colors.predictedLine,
      borderWidth: 3,
      backgroundColor: colors.predictedFill,
      borderDash: [8, 4],
      // VISUAL FIX: Hide the first point (the bridge)
      pointRadius: (ctx) => {
        const index = ctx.dataIndex;
        if (historical_dates.length > 0 && index === historical_dates.length - 1) {
            return 0;
        }
        return 5;
      },
      pointHoverRadius: 7,
      pointBackgroundColor: colors.pointBgDark,
      pointBorderColor: colors.predictedLine,
      pointBorderWidth: 2,
      spanGaps: true, // Crucial for ignoring nulls, though we filtered them out anyway
      fill: false,
    });
  }

  const data = {
    labels,
    datasets,
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#081427",
        titleColor: colors.text,
        bodyColor: "#e6eef8",
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
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
          font: { size: 10 },
        },
        grid: {
          color: colors.grid,
          drawOnChartArea: true,
          drawTicks: false,
        },
      },
      y: {
        ticks: {
          color: colors.text,
          callback: (value) => `$${Number(value).toFixed(0)}`,
        },
        grid: { color: colors.grid },
        beginAtZero: false,
      },
    },
    layout: {
      padding: { top: 6, right: 8, bottom: 6, left: 6 },
    },
  };

  if (!labels || labels.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-[#081427]">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
          Price Chart
        </h4>
        <div className="h-64 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
          No chart data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-[#081427]">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
        Price Chart
      </h4>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}