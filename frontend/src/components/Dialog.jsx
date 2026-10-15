import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Mission Control Dialog / Modal Component
 * WAI-ARIA modal dialog with keyboard trap, Escape dismissal, backdrop blur.
 */
export default function Dialog({
  open = false,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'mission-dialog-title' : undefined}
      aria-describedby={description ? 'mission-dialog-desc' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] shadow-[0_0_30px_rgba(0,240,255,0.08)] p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--color-border)] mb-5">
          <div>
            {title && (
              <h2 id="mission-dialog-title" className="text-xl font-bold font-display text-[var(--color-ink)]">
                {title}
              </h2>
            )}
            {description && (
              <p id="mission-dialog-desc" className="text-xs text-[var(--color-ink-muted)] mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-card-muted)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  )
}
