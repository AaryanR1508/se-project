// frontend/src/components/StockDropdown.jsx
import React from "react";

export default function StockDropdown({
  defaultTicker = "AAPL",
  onSearch = () => {},
  recent = [],
  popular = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"],
}) {
  const [value, setValue] = React.useState((defaultTicker || "").toUpperCase());
  const [days, setDays] = React.useState(7);
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);

  const merged = React.useMemo(() => {
    const uniq = Array.from(new Set([...(recent || []), ...popular])).map((t) =>
      t.toUpperCase()
    );
    return uniq;
  }, [recent, popular]);

  const filtered = React.useMemo(() => {
    const q = (value || "").trim().toUpperCase();
    if (!q) return merged.slice(0, 8);
    return merged.filter((t) => t.includes(q)).slice(0, 8);
  }, [value, merged]);

  React.useEffect(() => {
    setValue((defaultTicker || "").toUpperCase());
  }, [defaultTicker]);

  const rootRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  React.useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function submit() {
    const t = (value || "").trim().toUpperCase();
    if (!t) return;
    onSearch(t, days);
    setOpen(false);
  }

  function chooseSuggestion(t) {
    setValue(t);
    setOpen(false);
    setTimeout(() => onSearch(t, days), 60);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && filtered.length > 0) {
        const pick = filtered[Math.max(0, Math.min(highlight, filtered.length - 1))];
        if (pick) {
          chooseSuggestion(pick);
          return;
        }
      }
      submit();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlight(0);
      } else {
        setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
        setTimeout(() => {
          const el = listRef.current?.querySelectorAll('[role="option"]')?.[highlight + 1];
          el?.scrollIntoView?.({ block: "nearest" });
        }, 0);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) {
        setHighlight((h) => Math.max(h - 1, 0));
        setTimeout(() => {
          const el = listRef.current?.querySelectorAll('[role="option"]')?.[Math.max(highlight - 1, 0)];
          el?.scrollIntoView?.({ block: "nearest" });
        }, 0);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const dedupedRecent = Array.from(new Set(recent || [])).slice(0, 6);

  return (
    <div ref={rootRef} className="flex items-center gap-4 w-full">
      <div className="relative w-full sm:w-96">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm px-3 py-1.5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase());
              setOpen(true);
              setHighlight(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Ticker (e.g. AAPL)"
            aria-label="Ticker"
            className="flex-1 bg-transparent outline-none text-sm px-1 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />

          <div className="relative">
            <button
              onClick={() => setDays((d) => (d === 7 ? 14 : d === 14 ? 30 : 7))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 dark:bg-slate-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition"
              aria-label="Select days"
            >
              <span>{days}d</span>
              
            </button>
          </div>

          <button
            onClick={() => {
              setOpen((o) => !o);
              if (!open) setTimeout(() => inputRef.current?.focus(), 0);
            }}
            aria-expanded={open}
            aria-label="Toggle suggestions"
            className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-600 dark:text-gray-300 transform transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.941l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
          </button>

          <button
            onClick={submit}
            className="px-3 py-1.5 rounded-md bg-accent text-white text-sm hover:brightness-95 transition"
            aria-label="Search"
          >
            Search
          </button>
        </div>

        {open && filtered.length > 0 && (
          <div
            ref={listRef}
            role="listbox"
            aria-label="Ticker suggestions"
            className="absolute z-30 mt-2 w-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-auto"
          >
            {filtered.map((t, i) => {
              const active = i === highlight;
              return (
                <div
                  key={t + i}
                  role="option"
                  aria-selected={active}
                  onMouseDown={(ev) => { ev.preventDefault(); chooseSuggestion(t); }}
                  onMouseEnter={() => setHighlight(i)}
                  className={`px-3 py-2 text-sm cursor-pointer ${active ? "bg-accent/10 text-gray-900 dark:text-white" : "hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* recent quick buttons (hidden on very small screens) */}
      
    </div>
  );
}
