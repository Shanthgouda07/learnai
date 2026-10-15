import React from 'react'

/**
 * Mission Control Skeleton Component
 * Shimmer pulse placeholder with cosmic undertones.
 */
export default function Skeleton({ className = '', lines = 1, rounded = 'rounded-xl' }) {
  if (lines > 1) {
    return (
      <div className="space-y-3 w-full" aria-busy="true" aria-live="polite">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-[var(--color-card-muted)] border border-[rgba(255,255,255,0.04)] ${rounded} animate-pulse ${
              i === lines - 1 ? 'w-2/3' : 'w-full'
            } ${className}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`bg-[var(--color-card-muted)] border border-[rgba(255,255,255,0.04)] ${rounded} animate-pulse ${className}`}
      aria-hidden="true"
    />
  )
}
