import React from 'react'
import { X } from 'lucide-react'

/**
 * Mission Control Chip Component
 * Interactive tag or filter pill, with keyboard focus, active beacon, and optional dismiss button.
 */
export default function Chip({
  children,
  active = false,
  onClick,
  onRemove,
  icon: Icon,
  disabled = false,
  className = '',
  id,
}) {
  const isClickable = Boolean(onClick) && !disabled

  return (
    <span
      id={id}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all select-none border min-h-[32px] ${
        isClickable ? 'cursor-pointer' : ''
      } ${
        active
          ? 'bg-[var(--color-teal-wash)] text-[var(--color-teal)] border-[var(--color-teal)] shadow-[0_0_12px_rgba(0,240,255,0.25)]'
          : 'bg-[var(--color-card-muted)] text-[var(--color-ink-muted)] border-[var(--color-border)] hover:text-[var(--color-ink)] hover:border-[rgba(255,255,255,0.16)]'
      } ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(e)
          }}
          aria-label="Remove chip"
          className="ml-1 p-0.5 rounded-full hover:bg-[rgba(255,255,255,0.15)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)]"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
