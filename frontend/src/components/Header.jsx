// frontend/src/components/Header.jsx
import React from "react";
import { motion } from "framer-motion";

export default function Header({
  onSearch,
  recent = [],
  defaultTicker = "AAPL",
}) {
  const [val, setVal] = React.useState((defaultTicker || "").toUpperCase());
  const [days, setDays] = React.useState(7);

  React.useEffect(() => {
    setVal((defaultTicker || "").toUpperCase());
  }, [defaultTicker]);

  const submit = () => {
    const t = (val || "").trim().toUpperCase();
    if (!t) return;
    onSearch?.(t, days);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  const dedupedRecent = Array.from(new Set(recent || [])).slice(0, 6);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          AI Financial Advisor
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Stocks • Sentiment • Risk — powered by models
        </div>
      </div>

      
    </header>
  );
}
