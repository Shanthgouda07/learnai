import toast from 'react-hot-toast'
import React from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react'

/**
 * Mission Control Toast Helpers
 * Deep space navy glassmorphism with high contrast telemetry borders.
 */
const toastStyle = {
  background: 'var(--color-card)',
  color: 'var(--color-ink)',
  border: '1px solid var(--color-border)',
  borderRadius: '14px',
  boxShadow: '0 16px 36px -4px rgba(0,0,0,0.7), 0 0 20px rgba(0, 240, 255, 0.1)',
  fontSize: '13px',
  fontWeight: '500',
  padding: '12px 18px',
}

export const showToast = {
  success: (message, options = {}) =>
    toast(message, {
      icon: <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />,
      style: { ...toastStyle, borderColor: 'rgba(16, 185, 129, 0.35)' },
      ...options,
    }),

  error: (message, options = {}) =>
    toast(message, {
      icon: <AlertCircle className="w-4 h-4 text-[var(--color-danger)] shrink-0" />,
      style: { ...toastStyle, borderColor: 'rgba(244, 63, 94, 0.35)' },
      ...options,
    }),

  warning: (message, options = {}) =>
    toast(message, {
      icon: <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] shrink-0" />,
      style: { ...toastStyle, borderColor: 'rgba(245, 158, 11, 0.35)' },
      ...options,
    }),

  info: (message, options = {}) =>
    toast(message, {
      icon: <Info className="w-4 h-4 text-[var(--color-teal)] shrink-0" />,
      style: { ...toastStyle, borderColor: 'rgba(0, 240, 255, 0.35)' },
      ...options,
    }),

  achievement: (title, points = 50) =>
    toast(
      () => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-amber-wash)] border border-[rgba(245,158,11,0.4)] flex items-center justify-center text-[var(--color-amber)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs font-display text-[var(--color-ink)]">{title}</div>
            <div className="text-[11px] text-[var(--color-amber)] font-mono font-semibold">+{points} Orbit XP</div>
          </div>
        </div>
      ),
      {
        style: { ...toastStyle, borderColor: 'rgba(245, 158, 11, 0.4)' },
        duration: 3500,
      }
    ),
}

export default showToast
