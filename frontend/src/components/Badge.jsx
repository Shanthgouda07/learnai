import React from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'

/**
 * Mission Control Badge Component
 * Colorblind-safe with paired icons / patterns, high contrast borders.
 */
export function Badge({
  children,
  variant = 'teal', // 'teal' | 'amber' | 'green' | 'red' | 'slate'
  size = 'md',      // 'sm' | 'md'
  icon: CustomIcon,
  className = '',
  ...props
}) {
  const variantConfig = {
    teal: {
      classes: 'bg-[var(--color-teal-wash)] text-[var(--color-teal)] border border-[rgba(0,240,255,0.3)] shadow-[0_0_10px_rgba(0,240,255,0.15)]',
      DefaultIcon: Info,
    },
    amber: {
      classes: 'bg-[var(--color-amber-wash)] text-[var(--color-amber)] border border-[rgba(245,158,11,0.3)] shadow-[0_0_10px_rgba(245,158,11,0.15)]',
      DefaultIcon: AlertTriangle,
    },
    green: {
      classes: 'bg-[var(--color-success-wash)] text-[var(--color-success)] border border-[rgba(16,185,129,0.3)] shadow-[0_0_10px_rgba(16,185,129,0.15)]',
      DefaultIcon: CheckCircle2,
    },
    red: {
      classes: 'bg-[var(--color-danger-wash)] text-[var(--color-danger)] border border-[rgba(244,63,94,0.3)] shadow-[0_0_10px_rgba(244,63,94,0.15)]',
      DefaultIcon: AlertCircle,
    },
    slate: {
      classes: 'bg-[var(--color-card-muted)] text-[var(--color-ink-muted)] border border-[var(--color-border)]',
      DefaultIcon: null,
    },
  }

  const current = variantConfig[variant] || variantConfig.teal
  const IconToRender = CustomIcon !== undefined ? CustomIcon : current.DefaultIcon

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full tracking-wide select-none ${sizeClasses} ${current.classes} ${className}`}
      {...props}
    >
      {IconToRender && <IconToRender className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      <span>{children}</span>
    </span>
  )
}

/**
 * AI Transparency Badge
 * Luminous cyan-gold gradient with sparkles icon
 */
export function AiBadge({ label = 'AI Generated', className = '' }) {
  return (
    <span
      className={`badge-ai select-none ${className}`}
      title="Content drafted or assisted by AI pipeline, grounded in curriculum notes"
    >
      <Sparkles className="w-3.5 h-3.5 text-[var(--color-teal)] shrink-0 animate-pulse" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

export default Badge
