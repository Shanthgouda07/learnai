import React, { useState } from 'react'
import { Sparkles, RotateCcw, Check, AlertCircle } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function DemoBanner() {
  const [resetting, setResetting] = useState(false)

  const handleReset = async () => {
    if (!window.confirm('Reset all demo data back to baseline? This restores student scores, attention flags, and demo progress.')) {
      return
    }

    setResetting(true)
    try {
      const res = await axios.post('/api/demo/reset')
      if (res.data.success) {
        toast.success('Demo scenario reset: S-004, S-007, S-011 weak in variables; S-002 improved; S-009 inactive.')
        setTimeout(() => {
          window.location.reload()
        }, 800)
      }
    } catch (err) {
      toast.error('Failed to reset demo data: ' + (err.response?.data?.detail || err.message))
    } finally {
      setResetting(false)
    }
  }

  return (
    <div
      role="region"
      aria-label="Demo environment indicator"
      className="bg-gradient-to-r from-amber-500/10 via-[var(--color-teal-wash)] to-amber-500/10 border-b border-[var(--color-border)] py-1.5 px-4 text-xs flex items-center justify-between text-[var(--color-ink)]"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="font-semibold text-[var(--color-ink)]">
          Demo Mode Active
        </span>
        <span className="hidden sm:inline text-[var(--color-ink-muted)]">
          – Synthetic student data & local offline AI sandbox
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          disabled={resetting}
          aria-label="Reset demo scenario back to initial state"
          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-border-subtle)] font-medium text-[var(--color-ink)] transition-colors shadow-sm disabled:opacity-50 touch-target"
        >
          <RotateCcw className={`w-3 h-3 text-[var(--color-teal)] ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
        </button>
      </div>
    </div>
  )
}
