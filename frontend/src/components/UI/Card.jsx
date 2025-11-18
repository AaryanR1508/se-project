// frontend/src/components/UI/Card.jsx
import React from 'react'

export default function Card({ children, title, footer, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-card shadow-card p-4 card-border ${className}`}>
      {title && <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</h3></div>}
      <div>{children}</div>
      {footer && <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">{footer}</div>}
    </div>
  )
}
