import React from 'react'

export default function Tabs({ tabs = [], defaultTabId = null, onChange = () => {}, children }) {
  const first = defaultTabId ?? (tabs[0] && tabs[0].id)
  const [active, setActive] = React.useState(first)

  React.useEffect(() => { onChange(active) }, [active])

  return (
    <div>
      <div role="tablist" aria-label="Main tabs" className="flex gap-2 mb-4">
        {tabs.map((t) => {
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              id={`${t.id}-tab`}            // 👈 important: gives us #sentiment-tab, #price-tab, etc.
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-accent text-white shadow'
                  : 'bg-white/90 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div>
        {typeof children === 'function' ? children(active) : children}
      </div>
    </div>
  )
}
