import React from 'react'
import { Rocket, ArrowRight } from 'lucide-react'
import Button from './Button'

/**
 * Mission Control Empty State Component
 * Orbit beacon visual with Space Grotesk headline and clear primary action.
 */
export default function EmptyState({
  icon: Icon = Rocket,
  title = 'No active telemetry',
  description = 'Your orbit path is clear! Explore curriculum notes or launch a practice game to continue.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`mission-card p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto border border-[var(--color-border)] rounded-2xl ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-teal-wash)] border border-[rgba(0,240,255,0.3)] text-[var(--color-teal)] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold font-display text-[var(--color-ink)] mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md" iconRight={ArrowRight}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
