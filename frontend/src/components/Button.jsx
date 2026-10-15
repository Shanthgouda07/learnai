import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Mission Control Button Component
 * Fully keyboard accessible, minimum 44px touch targets, colorblind-safe variants.
 */
export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'warm' | 'danger' | 'ghost' | 'outline'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  id,
  ...props
}) {
  const sizeClasses = {
    sm: 'min-h-[44px] py-2 px-3.5 text-xs font-semibold rounded-xl gap-2',
    md: 'min-h-[44px] py-2.5 px-5 text-sm font-semibold rounded-xl gap-2.5',
    lg: 'min-h-[48px] py-3 px-6 text-base font-semibold rounded-2xl gap-3',
  }

  const variantClasses = {
    // Electric Cyan Primary with Ion Glow
    primary: 'mission-btn-primary bg-[var(--color-teal)] text-[#05070D] font-bold shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] border border-transparent',
    
    // Deep Space Surface Layer Secondary
    secondary: 'mission-btn-secondary bg-[var(--color-card-muted)] text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[rgba(255,255,255,0.16)]',
    
    // Telemetry Amber / Points / Streak Action
    warm: 'bg-[var(--color-amber)] text-[#05070D] font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:bg-[var(--color-amber-hover)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-transparent',
    
    // Danger / Critical Action
    danger: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50',
    
    // Transparent Ghost
    ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-card-muted)] border border-transparent',
    
    // Outline Beacon
    outline: 'bg-transparent text-[var(--color-teal)] border border-[var(--color-teal)] hover:bg-[var(--color-teal-wash)]',
  }

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center select-none cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className={`animate-spin shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} aria-hidden="true" />
      ) : Icon ? (
        <Icon className={`shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} aria-hidden="true" />
      ) : null}

      <span className="truncate">{children}</span>

      {!loading && IconRight && (
        <IconRight className={`shrink-0 ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} aria-hidden="true" />
      )}
    </button>
  )
}
