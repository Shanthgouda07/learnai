import React, { useState } from 'react'
import { Trash2, AlertTriangle, X, Check, Shield } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function DeleteRequestDialog({ isOpen, onClose, onSubmitted }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await axios.post('/api/privacy/delete-request', {
        reason: reason.trim(),
      })
      if (res.data.success) {
        toast.success('Deletion request submitted to your teacher for approval.')
        if (onSubmitted) onSubmitted()
        onClose()
      }
    } catch (err) {
      toast.error('Failed to submit deletion request: ' + (err.response?.data?.detail || err.message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg notebook-card p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 id="delete-dialog-title" className="text-lg font-bold text-[var(--color-ink)]">
              Request Data Deletion
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg hover:bg-[var(--color-border-subtle)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-[var(--color-ink)] space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>School Data Ownership & Approval</span>
          </div>
          <p className="leading-relaxed text-[var(--color-ink-muted)]">
            Because school educational records are maintained by your educational institution, requests are reviewed and approved by your teacher.
          </p>
          <p className="leading-relaxed text-[var(--color-ink-muted)]">
            Upon approval, your name, profile, enrollments, and personal AI logs are <strong>hard deleted</strong>. Practice session scores are replaced with anonymized aggregates so class learning analytics stay valid.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5">
              Reason for Request (Optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Graduating, moving to another school, or privacy preference..."
              className="w-full notebook-input text-xs resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="notebook-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Deletion Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
