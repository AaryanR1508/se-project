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
    showHistorical = true,
    showPredicted = true,
}) {
    const labels = [...(historical_dates || []), ...(prediction_dates || [])];
    const histSet = [...(historical_prices || []), ...new Array(prediction_dates?.length || 0).fill(null)];
    const predSet = [...new Array(historical_dates?.length || 0).fill(null), ...(predictions || [])];

    // 🎯 FIX: Hardcode isDark to true since the app is default dark
    const isDark = true;

    const colors = {
        // Now directly using the light, high-contrast colors for text/grid
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
            pointBackgroundColor: colors.pointBgDark, // Using the dark background point color
            pointBorderColor: colors.historicalLine,
            pointBorderWidth: 2,
            spanGaps: true,
            fill: 'start',
        });
    }

    if (showPredicted) {
        datasets.push({
            label: "Predicted",
            data: predSet,
            tension: 0.35,
            borderColor: colors.predictedLine,
            borderWidth: 3,
            backgroundColor: colors.predictedFill,
            borderDash: [8, 4],
            pointRadius: 5, 
            pointHoverRadius: 7,
            pointBackgroundColor: colors.pointBgDark, // Using the dark background point color
            pointBorderColor: colors.predictedLine,
            pointBorderWidth: 2,
            spanGaps: true,
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
            legend: { 
                display: false, 
            }, 
            tooltip: {
                enabled: true,
                // Using hardcoded dark colors for tooltip background/border
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
                    font: { size: 10 }
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

    if (!labels || labels.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-[#081427]">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Price Chart</h4>
                <div className="h-64 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                    No chart data available
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-[#081427]">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Price Chart</h4>
            <div className="h-64">
                <Line data={data} options={options} />
            </div>
        </div>
    );
}