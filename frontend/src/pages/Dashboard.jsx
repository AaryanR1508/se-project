// frontend/src/pages/Dashboard.jsx
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "../components/Header";
import StockDropdown from "../components/StockDropDown";
import Tabs from "../components/Tabs";
import PriceChart from "../components/PriceChart";
import SentimentCard from "../components/SentimentCard";
import RiskCard from "../components/RiskCard";
import Skeleton from "../components/UI/Skeleton";
import Card from "../components/UI/Card";
import { fetchPrediction, fetchSentiment, fetchRisk } from "../api/client";
import HistoryTable from "../components/HistoryTable";

export default function Dashboard() {
  const [ticker, setTicker] = React.useState("AAPL");
  const [days, setDays] = React.useState(7);
  const [recent, setRecent] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("recent") || "[]") } catch { return [] }
  });

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
    setRecent(prev => {
      const next = [ticker, ...prev.filter(x => x !== ticker)].slice(0,12);
      try { localStorage.setItem("recent", JSON.stringify(next)) } catch {}
      return next;
    });
  }, [ticker]);

  function handleSearch(t, d = 7) {
    if (!t) return;
    const up = t.toUpperCase();
    setTicker(up);
    setDays(d);
    qc.invalidateQueries({ queryKey: ["predict"] });
    qc.prefetchQuery({ queryKey: ["predict", up, d], queryFn: () => fetchPrediction(up, d) });
    qc.prefetchQuery({ queryKey: ["sentiment", up], queryFn: () => fetchSentiment(up) });
    qc.prefetchQuery({ queryKey: ["risk", up, d], queryFn: () => fetchRisk(up, d) });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Header onSearch={handleSearch} recent={recent} defaultTicker={ticker} />

        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dashboard</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">Overview for {ticker}</div>
            </div>
            <div className="w-[360px] hidden md:block">
              <StockDropdown defaultTicker={ticker} onSearch={handleSearch} recent={recent}/>
            </div>
          </div>

          <Tabs tabs={[
            { id: 'price', label: 'Price' },
            { id: 'sentiment', label: 'Sentiment' },
            
            { id: 'history', label: 'History' },
          ]} defaultTabId="price">
            {(active) => (
              <div>
                {active === 'price' && (
                  <div className="space-y-6">
                    <Card>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Current price</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${predQ.data ? predQ.data.current_price : '--'}</div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Next {predQ.data?.predictions?.length ?? days} days</div>
                      </div>

                      <div className="mt-6">
                        {predQ.isLoading ? <Skeleton className="h-64" /> : predQ.data ? (
                          <div className="bg-white dark:bg-[#081427] rounded-xl p-4">
                            <div className="w-full h-80 md:h-96">
                              <PriceChart
                                historical_dates={predQ.data.historical_dates}
                                historical_prices={predQ.data.historical_prices}
                                prediction_dates={predQ.data.prediction_dates}
                                predictions={predQ.data.predictions}
                              />
                            </div>
                          </div>
                        ) : <div className="text-sm text-gray-500 dark:text-gray-400">No price data available.</div>}
                      </div>
                    </Card>

                    {active === 'price' && (
  <div className="space-y-6">
    {/* existing Price content: current price + chart + predictions */}
    {/* ...your current stuff stays here... */}

    {/* 👉 NEW: Risk section lives under Price now */}
    <div className="mt-4">
      <div className="bg-[#0F162A] rounded-xl shadow-card card-border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-100">Risk assessment</h3>
          <span className="text-xs text-gray-400">
            Based on latest price volatility and sentiment.
          </span>
        </div>

        <p className="text-xs mb-3 text-gray-400">
          Note: risk is analysed using the <span className="font-semibold">latest sentiment</span>.{" "}
          <button
            type="button"
            onClick={() => {
              // programmatically switch to Sentiment tab by "clicking" it
              document.getElementById("sentiment-tab")?.click();
            }}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            View detailed sentiment →
          </button>
        </p>

        {riskQ.isLoading ? (
          <div className="text-sm text-gray-400">Loading risk scores…</div>
        ) : riskQ.isError ? (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 text-sm text-red-400">
            Failed to load risk: {riskQ.error?.message ?? "Unknown error"}
          </div>
        ) : riskQ.data ? (
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Risk level</div>
              <div className="text-lg font-semibold text-gray-100">
                {riskQ.data.risk_level ?? "—"}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Volatility</div>
              <div className="text-lg font-semibold text-gray-100">
                {riskQ.data.volatility != null
                  ? `${riskQ.data.volatility.toFixed(2)}%`
                  : "—"}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/10 sm:col-span-1">
              <div className="text-xs text-gray-400 mb-1">Recommendation</div>
              <div className="text-sm font-medium text-gray-100">
                {riskQ.data.recommendation ?? "—"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">No risk data available.</div>
        )}
      </div>
    </div>
  </div>
)}

                    {predQ.data && (
                      <Card title="Predictions">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {predQ.data.prediction_dates.map((d,i) => (
                            <div key={i} className="p-4 bg-gray-50 dark:bg-[#051025] rounded-lg">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{d}</div>
                              <div className="text-lg font-semibold mt-2 text-gray-900 dark:text-gray-100">${(predQ.data.predictions[i]).toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {active === 'sentiment' && (
                  <Card title="News Sentiment">
                    {sentQ.isLoading ? <Skeleton className="h-40" /> : sentQ.isError ? (
                      <div className="p-3 rounded-md bg-red-50 dark:bg-red-900 text-white">Error: {sentQ.error?.message ?? 'Failed to fetch news'}</div>
                    ) : sentQ.data ? <SentimentCard per_article={sentQ.data.per_article || []} overall={sentQ.data.overall || {}} /> : <div className="text-sm text-gray-500 dark:text-gray-400">No sentiment data.</div>}
                  </Card>
                )}



                {active === 'history' && (
                    <div className="space-y-6">
                        <HistoryTable
                        dates={predQ.data?.historical_dates || []}
                        prices={predQ.data?.historical_prices || []}
                        maxHeight="max-h-200"  // adjust if you want taller
                        />
                    </div>
                )}
              </div>
            )}
          </Tabs>
        </div>

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">Tip: try other tickers. Recent searches are stored locally.</div>
      </div>
    </div>
  );
}
