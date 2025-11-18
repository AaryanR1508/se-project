// frontend/src/components/HistoryTable.jsx
import React from "react";

export default function HistoryTable({ dates = [], prices = [] }) {
  const rows = (dates || []).map((d, i) => ({
    date: d,
    price: prices?.[i] ?? null,
  }));

  return (
    <div className="bg-[#0F162A] dark:bg-[#0F162A] rounded-xl shadow-lg border border-white/5 overflow-hidden">
      {/* header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/3">
        <h3 className="text-lg font-semibold text-gray-100">Historical Prices</h3>
      </div>

      {/* table header */}
      <div className="grid grid-cols-2 px-6 py-3 text-sm font-medium text-gray-400 border-b border-white/10">
        <div>Date</div>
        <div className="text-right">Price</div>
      </div>

      {/* table body */}
      <div className="max-h-[460px] overflow-auto">
        {rows.map((r, idx) => (
          <div
            key={r.date + idx}
            className="
              grid grid-cols-2 px-6 py-4 
              text-sm 
              border-b border-white/5 
              hover:bg-white/5 transition
            "
          >
            <div className="text-gray-300">{r.date}</div>
            <div className="text-right font-semibold text-gray-100">
              {r.price != null ? `$${Number(r.price).toFixed(2)}` : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
