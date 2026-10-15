import React, { useRef } from 'react'

/**
 * Mission Control Tabs Component
 * WAI-ARIA compliant tab navigation with arrow key navigation.
 */
export default function Tabs({
  tabs = [], // [{ id, label, icon: Icon, badge }]
  activeTab,
  onChange,
  className = '',
  ariaLabel = 'Navigation tabs',
}) {
  const tabRefs = useRef({})

  const handleKeyDown = (e, index) => {
    if (tabs.length === 0) return

    let nextIndex = index
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextIndex = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      nextIndex = (index - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = tabs.length - 1
    } else {
      return
    }

    const nextTab = tabs[nextIndex]
    onChange?.(nextTab.id)
    tabRefs.current[nextTab.id]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex items-center gap-1 p-1.5 bg-[var(--color-card-muted)] border border-[var(--color-border)] rounded-2xl overflow-x-auto ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange?.(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] ${
              isActive
                ? 'bg-[var(--color-card)] text-[var(--color-teal)] border border-[var(--color-border)] shadow-[0_4px_16px_rgba(0,0,0,0.4)] shadow-[0_0_15px_rgba(0,240,255,0.15)] font-bold'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] border border-transparent'
            }`}
          >
            {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--color-teal)]' : ''}`} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-[var(--color-teal-wash)] text-[var(--color-teal)]'
                    : 'bg-[rgba(255,255,255,0.06)] text-[var(--color-ink-muted)]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
