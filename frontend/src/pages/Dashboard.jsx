// frontend/src/pages/Dashboard.jsx
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion"; // IMPORTANT: Ensure motion is imported here
import Header from "../components/Header";
import StockDropdown from "../components/StockDropDown";
import Tabs from "../components/Tabs";
import PriceChart from "../components/PriceChart";
import SentimentCard from "../components/SentimentCard";
import Skeleton from "../components/UI/Skeleton";
import Card from "../components/UI/Card";
import { fetchPrediction, fetchSentiment, fetchRisk } from "../api/client";
import HistoryTable from "../components/HistoryTable";

export default function Dashboard() {
  const [ticker, setTicker] = React.useState("");
  const [days, setDays] = React.useState(7);
  const [recent, setRecent] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recent") || "[]");
    } catch {
      return [];
    }
  });

  const [showHistorical, setShowHistorical] = React.useState(true);
  const [showPredicted, setShowPredicted] = React.useState(true);

  const qc = useQueryClient();

  const predQ = useQuery({
    queryKey: ["predict", ticker, days],
    queryFn: () => fetchPrediction(ticker, days),
    enabled: !!ticker,
  });

  const sentQ = useQuery({
    queryKey: ["sentiment", ticker],
    queryFn: () => fetchSentiment(ticker),
    enabled: !!ticker,
  });

  const riskQ = useQuery({
    queryKey: ["risk", ticker, days],
    queryFn: () => fetchRisk(ticker, days),
    enabled: !!ticker,
  });

  React.useEffect(() => {
    if (!ticker) return;
    setRecent((prev) => {
      const next = [ticker, ...prev.filter((x) => x !== ticker)].slice(0, 12);
      try {
        localStorage.setItem("recent", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [ticker]);

  function handleSearch(t, d = 7) {
    if (!t) return;
    const up = t.toUpperCase();
    setTicker(up);
    setDays(d);
    qc.invalidateQueries({ queryKey: ["predict"] });
    qc.prefetchQuery({
      queryKey: ["predict", up, d],
      queryFn: () => fetchPrediction(up, d),
    });
    qc.prefetchQuery({
      queryKey: ["sentiment", up],
      queryFn: () => fetchSentiment(up),
    });
    qc.prefetchQuery({
      queryKey: ["risk", up, d],
      queryFn: () => fetchRisk(up, d),
    });
  }

  function handleDaysChange(newDays) {
    setDays(newDays);
    if (ticker) {
      qc.invalidateQueries({ queryKey: ["predict"] });
      qc.prefetchQuery({
        queryKey: ["predict", ticker, newDays],
        queryFn: () => fetchPrediction(ticker, newDays),
      });
      qc.prefetchQuery({
        queryKey: ["risk", ticker, newDays],
        queryFn: () => fetchRisk(ticker, newDays),
      });
    }
  }

  const getChartColor = (type) => {
    const isDark = true;
    if (type === "historical") {
      return isDark ? "#A78BFA" : "#4F46E5";
    }
    if (type === "predicted") {
      return isDark ? "#10B981" : "#059669";
    }
    return "#CCC";
  };

  const LegendButton = ({ label, type, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 text-sm font-medium transition duration-150 ease-in-out
                ${
                  isActive
                    ? "text-white border-gray-500 bg-gray-700 shadow-inner"
                    : "text-gray-300 border-gray-600 bg-gray-700/50 hover:bg-gray-700"
                } 
                px-3 py-1 rounded-lg border`}
    >
      <span
        className="w-3 h-3 rounded-full border-2"
        style={{
          backgroundColor: isActive ? getChartColor(type) : "transparent",
          borderColor: getChartColor(type),
        }}
      />
      <span>{label}</span>
    </button>
  );

  const showUhOh =
    ticker && predQ.isError && predQ.error?.message?.includes("404");

  // Helper to calculate the range of historical data in days
  const calculatedHistoricalDays = React.useMemo(() => {
    const dates = predQ.data?.historical_dates;

    if (!dates || dates.length < 2) {
      return null;
    }

    const startDateStr = dates[0];
    const endDateStr = dates[dates.length - 1];

    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());

      // Convert milliseconds to days
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 14) {
        diffDays = diffDays + 3;
      } else {
        diffDays = diffDays + 2;
      }

      return diffDays;
    } catch (e) {
      console.error("Error parsing historical dates:", e);
      return null;
    }
  }, [predQ.data]);

  const historicalRangeMessage =
    calculatedHistoricalDays !== null && calculatedHistoricalDays > 0
      ? `Showing the data of last ${calculatedHistoricalDays} days • The market is closed on Saturdays and Sundays.`
      : "No history range available.";

  // Animation variants for the Body Content
  const bodyVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.3, // Delay slightly so the header loads first
      },
    },
  };

  const getRiskClass = (level) => {
    if (level === null || level === undefined) return "text-gray-100";
    const s = String(level).trim().toLowerCase();

    // string-based checks
    if (["low", "safe", "green"].includes(s)) return "text-green-400";
    if (["medium", "med", "moderate", "yellow"].includes(s))
      return "text-yellow-400";
    if (["high", "severe", "danger", "red"].includes(s)) return "text-red-400";

    // numeric fallback (expects 0..1 or 0..100 — handles both roughly)
    const n = parseFloat(s);
    if (!isNaN(n)) {
      const v = n > 1 ? n / 100 : n; // if >1 treat as percent
      if (v <= 0.33) return "text-green-400";
      if (v <= 0.66) return "text-yellow-400";
      return "text-red-400";
    }

    // default
    return "text-gray-100";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Header
          onSearch={handleSearch}
          recent={recent}
          defaultTicker={ticker}
        />

        {/* Applying motion to the body content */}
        <motion.div variants={bodyVariants} initial="hidden" animate="visible">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Dashboard
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Overview for {ticker || "..."}
                </div>
              </div>
              <div className="w-[360px] hidden md:block">
                <StockDropdown
                  onSearch={handleSearch}
                  recent={recent}
                  currentDays={days}
                  onDaysChange={handleDaysChange}
                />
              </div>
            </div>

            {!ticker ? (
              <div className="flex flex-col items-center justify-center h-[50vh] bg-[#0F162A] rounded-xl shadow-lg border border-gray-700">
                <h3 className="text-3xl font-bold text-indigo-400 mb-4">
                  Welcome! 🚀
                </h3>
                <p className="text-lg text-gray-300 mb-6">
                  Enter a stock ticker to get started.
                </p>
                <p className="text-md text-gray-400">
                  Use the search bar above to find predictions, sentiment, and
                  risk analysis.
                </p>
              </div>
            ) : showUhOh ? (
              <div className="flex flex-col items-center justify-center h-[50vh] bg-[#0F162A] rounded-xl shadow-lg border border-gray-700">
                <h3 className="text-3xl font-bold text-red-500 mb-4">
                  Uh-Oh! 🚨
                </h3>
                <p className="text-lg text-gray-300 mb-6">
                  We couldn't find data for the requested ticker, or the input
                  was invalid.
                </p>
                <p className="text-md text-gray-400">
                  Please input a valid stock ticker in the search bar above.
                </p>
                {predQ.isError && (
                  <p className="text-xs mt-3 text-gray-500">
                    Error: {predQ.error?.message}
                  </p>
                )}
              </div>
            ) : (
              <Tabs
                tabs={[
                  { id: "price", label: "Price & Risk" },
                  { id: "sentiment", label: "Sentiment" },
                  { id: "history", label: "History" },
                ]}
                defaultTabId="price"
              >
                {(active) => (
                  <div>
                    {active === "price" && (
                      <div className="space-y-6">
                        <Card>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Current price
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                ${predQ.data ? predQ.data.current_price : "--"}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Next {predQ.data?.predictions?.length ?? days}{" "}
                              days
                            </div>
                          </div>

                          <div className="mt-6">
                            {predQ.isLoading ? (
                              <Skeleton className="h-64" />
                            ) : predQ.data ? (
                              <div className="bg-white dark:bg-[#081427] rounded-xl p-4">
                                <div className="flex space-x-6 justify-center mb-4">
                                  <LegendButton
                                    label="Historical Price"
                                    type="historical"
                                    isActive={showHistorical}
                                    onClick={() => setShowHistorical((s) => !s)}
                                  />
                                  <LegendButton
                                    label="Predicted Price"
                                    type="predicted"
                                    isActive={showPredicted}
                                    onClick={() => setShowPredicted((s) => !s)}
                                  />
                                </div>

                                <div className="w-full h-80 md:h-96">
                                  <PriceChart
                                    historical_dates={
                                      predQ.data.historical_dates
                                    }
                                    historical_prices={
                                      predQ.data.historical_prices
                                    }
                                    prediction_dates={
                                      predQ.data.prediction_dates
                                    }
                                    predictions={predQ.data.predictions}
                                    showHistorical={showHistorical}
                                    showPredicted={showPredicted}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                No price data available.
                              </div>
                            )}
                          </div>
                        </Card>

                        {/* Integrated Risk Section */}
                        <div className="space-y-6">
                          <div className="mt-4">
                            <div className="bg-[#0F162A] rounded-xl shadow-card card-border p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-100">
                                  Risk assessment
                                </h3>
                                <span className="text-xs text-gray-400">
                                  Based on latest price volatility and
                                  sentiment.
                                </span>
                              </div>

                              <p className="text-xs mb-3 text-gray-400">
                                Note: risk is analysed using the{" "}
                                <span className="font-semibold">
                                  latest sentiment
                                </span>
                                .{" "}
                                <button
                                  type="button"
                                  onClick={() => {
                                    document
                                      .getElementById("sentiment-tab")
                                      ?.click();
                                  }}
                                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                                >
                                  View detailed sentiment →
                                </button>
                              </p>

                              {riskQ.isLoading ? (
                                <div className="text-sm text-gray-400">
                                  Loading risk scores…
                                </div>
                              ) : riskQ.isError ? (
                                <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 text-sm text-red-400">
                                  Failed to load risk:{" "}
                                  {riskQ.error?.message ?? "Unknown error"}
                                </div>
                              ) : riskQ.data ? (
                                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="text-xs text-gray-400 mb-1">
                                      Risk level
                                    </div>
                                    <div
                                      className={`text-lg font-semibold ${getRiskClass(
                                        riskQ.data.risk_level
                                      )}`}
                                    >
                                      {riskQ.data.risk_level ?? "—"}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="text-xs text-gray-400 mb-1">
                                      Volatility
                                    </div>
                                    <div className="text-lg font-semibold text-gray-100">
                                      {riskQ.data.volatility != null
                                        ? `${riskQ.data.volatility.toFixed(2)}%`
                                        : "—"}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 sm:col-span-1">
                                    <div className="text-xs text-gray-400 mb-1">
                                      Recommendation
                                    </div>
                                    <div className="text-sm font-medium text-gray-100">
                                      {riskQ.data.recommendation ?? "—"}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-400">
                                  No risk data available.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Predictions Card */}
                        {predQ.data && (
                          <Card title="Predictions">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {predQ.data.prediction_dates.map((d, i) => (
                                <div
                                  key={i}
                                  className="p-4 bg-gray-50 dark:bg-[#051025] rounded-lg"
                                >
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {d}
                                  </div>
                                  <div className="text-lg font-semibold mt-2 text-gray-900 dark:text-gray-100">
                                    ${predQ.data.predictions[i].toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}
                      </div>
                    )}

                    {active === "sentiment" && (
                      <Card title="News Sentiment">
                        {sentQ.isLoading ? (
                          <Skeleton className="h-40" />
                        ) : sentQ.isError ? (
                          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 text-sm text-red-400">
                            Couldn't fetch the news data currently. Please try
                            again later.
                          </div>
                        ) : sentQ.data ? (
                          <SentimentCard
                            per_article={sentQ.data.per_article || []}
                            overall={sentQ.data.overall || {}}
                          />
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            No sentiment data.
                          </div>
                        )}
                      </Card>
                    )}

                    {active === "history" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Historical Data
                          </h3>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {historicalRangeMessage}
                        </div>

                        <HistoryTable
                          dates={predQ.data?.historical_dates || []}
                          prices={predQ.data?.historical_prices || []}
                          maxHeight="max-h-200"
                        />
                      </div>
                    )}
                  </div>
                )}
              </Tabs>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            Tip: try other tickers. Recent searches are stored locally.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
