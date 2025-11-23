// frontend/src/components/SentimentCard.jsx
import React from 'react'

export default function SentimentCard({ per_article = [], overall = { label: null, score: null } }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Overall</div>
        <div className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-md capitalize">
          {overall.label ?? '—'}
        </div>
      </div>

      <div className="space-y-2">
        {per_article.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No news found.</div>
        ) : per_article.map((a, i) => (
          <div key={i} className="p-3 bg-gray-50 dark:bg-[#051025] rounded-lg">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{a.source ?? ''}</div>
            {a.sentiment && <div className="text-xs mt-1 text-gray-600 dark:text-gray-300 capitalize">Sentiment: {a.sentiment.label} ({(a.sentiment.score ?? 0).toFixed(2)})</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
