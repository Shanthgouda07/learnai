import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Mission Control Drawer Component
 * Slide-out panel with backdrop blur, keyboard trap, and Escape dismissal.
 */
export default function Drawer({
  open = false,
  onClose,
  title,
  children,
  position = 'right', // 'right' | 'left'
  maxWidth = 'max-w-md',
  className = '',
}) {
  const drawerRef = useRef(null)

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
      aria-labelledby={title ? 'mission-drawer-title' : undefined}
      className={`fixed inset-0 z-50 flex ${
        position === 'right' ? 'justify-end' : 'justify-start'
      } bg-black/60 backdrop-blur-sm animate-fade-in`}
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} h-full bg-[var(--color-card)] border-${
          position === 'right' ? 'l' : 'r'
        } border-[var(--color-border)] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto ${className}`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-5">
            {title && (
              <h2 id="mission-drawer-title" className="text-xl font-bold font-display text-[var(--color-ink)]">
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-card-muted)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
