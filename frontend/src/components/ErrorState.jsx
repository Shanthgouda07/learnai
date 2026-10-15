import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import Button from './Button'

/**
 * Mission Control Error State Component
 * Telemetry interruption alert with colorblind safe warning icon and retry action.
 */
export default function ErrorState({
  title = 'Signal Interrupted',
  description = 'Unable to establish link with the learning telemetry service. Please verify your connection or attempt a reconnect.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`mission-card p-10 text-center flex flex-col items-center justify-center max-w-lg mx-auto border border-rose-500/20 bg-[var(--color-card)] rounded-2xl ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
        <AlertTriangle className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold font-display text-[var(--color-ink)] mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="md" icon={RotateCcw}>
          Reconnect Signal
        </Button>
      )}
    </div>
  )
}
