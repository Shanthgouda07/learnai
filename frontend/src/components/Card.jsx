import React from 'react'

/**
 * Mission Control Card Component
 * Glassmorphic surface, low-opacity white border, optional interactive beacon glow on hover.
 */
export default function Card({
  children,
  className = '',
  hover = false,
  elevated = false,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`mission-card relative overflow-hidden p-6 rounded-2xl ${
        elevated ? 'bg-[var(--color-card-muted)] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)]' : 'bg-[var(--color-card)]'
      } border border-[var(--color-border)] ${
        hover
          ? 'cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-border-glow)] hover:shadow-[0_12px_36px_0_rgba(0,240,255,0.1)]'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
