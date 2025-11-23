// frontend/src/components/StockDropdown.jsx
import React from "react";

export default function StockDropdown({
    onSearch = () => {},
    recent = [],
    popular = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN"],
}) {
    const [value, setValue] = React.useState(""); 
    const [days, setDays] = React.useState(7);

    const popularTickers = React.useMemo(() => {
        return popular.slice(0, 5).map(t => t.toUpperCase());
    }, [popular]);

    const inputRef = React.useRef(null); 

    function submitSearch() {
        const t = (value || "").trim().toUpperCase();
        if (!t) return;
        onSearch(t, days);
    }
    
    function selectPopular(t) {
        const up = t.toUpperCase();
        setValue(up);
        onSearch(up, days);
    }

    function changeDays(newDays) {
        setDays(newDays);
        const t = (value || "").trim().toUpperCase();
        if (t) {
            onSearch(t, newDays);
        }
    }

    function onKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            submitSearch();
        }
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Main Search Bar (Input, Days Toggler, Search Button) */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm px-3 py-1.5 border border-gray-100 dark:border-gray-700">
                
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value.toUpperCase());
                    }}
                    onKeyDown={onKeyDown} 
                    placeholder="Search ticker (e.g. AMZN)"
                    aria-label="Ticker search"
                    className="flex-1 bg-transparent outline-none text-sm px-1 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />

                <div className="relative">
                    <button
                        onClick={() => changeDays(days === 7 ? 14 : days === 14 ? 30 : 7)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-50 dark:bg-slate-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition"
                        aria-label="Select days"
                    >
                        <span>{days}d</span>
                    </button>
                </div>
                
                <button
                    onClick={submitSearch} 
                    className="px-3 py-1.5 rounded-md bg-accent text-white text-sm hover:bg-blue-600 transition"
                    aria-label="Search"
                >
                    Search
                </button>
            </div>

            {/* Popular Ticker Buttons (New Row with Label) */}
            <div className="flex flex-col gap-1">
                {/* 🎯 ADDED LABEL HERE */}
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">
                    Popular Tickers:
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                    {popularTickers.map(t => (
                        <button
                            key={t}
                            onClick={() => selectPopular(t)}
                            className={`px-3 py-1 rounded-full border text-gray-700 dark:text-gray-300 transition ${value === t ? 'bg-indigo-100 border-indigo-500 dark:bg-indigo-900/50' : 'bg-white border-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:hover:bg-slate-700'}`}
                            aria-label={`Quick select ${t}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}