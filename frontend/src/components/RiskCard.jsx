// frontend/src/components/RiskCard.jsx
import React from 'react'

export default function RiskCard({ volatility = null, risk_level = null, recommendation = null }) {
  return (
    <div>
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Risk</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Volatility: {volatility ?? '--'}</div>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-[#051025] rounded-lg">
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{risk_level ?? 'Unknown'}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{recommendation ?? 'No recommendation'}</div>
      </div>
    </div>
  )
}
