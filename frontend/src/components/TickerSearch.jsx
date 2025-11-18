import React from 'react'

export default function TickerSearch({ onSearch, defaultTicker = 'AAPL' }) {
  const [val, setVal] = React.useState(defaultTicker)
  return (
    <div className="flex items-center gap-3">
      <input
        className="px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
        value={val}
        onChange={(e) => setVal(e.target.value.toUpperCase())}
        placeholder="Enter ticker e.g. AAPL"
      />
      <button
        className="px-4 py-2 bg-accent text-white rounded-md hover:bg-indigo-600 transition"
        onClick={() => onSearch(val.trim())}
      >
        Search
      </button>
    </div>
  )
}
