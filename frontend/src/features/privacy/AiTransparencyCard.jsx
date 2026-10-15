import React, { useState, useEffect } from 'react'
import { Sparkles, Shield, CheckCircle2, XCircle, ShieldAlert, Cpu } from 'lucide-react'
import axios from 'axios'

export default function AiTransparencyCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    axios.get('/api/privacy/ai-transparency')
      .then(res => {
        if (mounted) setData(res.data)
      })
      .catch(err => {
        console.warn('Failed to fetch AI transparency stats:', err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const sentItems = data?.what_is_sent_to_ai || [
    'Sanitized query text with names replaced by pseudonyms (e.g. S-004)',
    'Curriculum topic and targeted sub-concept (e.g. "for_loops")',
    'Retrieved course note excerpts (RAG context from approved notes only)',
    'Target learning stage or grade level context',
  ]

  const neverSentItems = data?.what_is_never_sent_to_ai || [
    'Student real names and nicknames',
    'Email addresses, phone numbers, or contact information',
    'Physical location or IP addresses',
    'Direct quiz answer keys or confidential teacher grading notes',
    'Cross-class or cross-student historical performance dossiers',
  ]

  const metrics = data?.live_metrics || {
    total_ai_requests: 0,
    requests_with_pii_intercepted: 0,
    names_redacted_count: 0,
    emails_redacted_count: 0,
    phones_redacted_count: 0,
    total_pii_tokens_shielded: 0,
  }

  return (
    <div className="space-y-6">
      {/* Live PII Shield Counter Banner */}
      <div className="notebook-card p-5 bg-gradient-to-br from-[var(--color-teal-wash)] to-[var(--color-card)] border-[var(--color-teal)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-teal)] text-white flex items-center justify-center shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--color-ink)] flex items-center gap-2">
                <span>Live PII Sanitization Shield</span>
                <span className="badge-ai text-[10px]">Active</span>
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)]">
                Every prompt is scrubbed by deterministic regex sanitizers before external model dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-center self-stretch sm:self-auto justify-around sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--color-border)]">
            <div>
              <div className="text-lg font-extrabold text-[var(--color-teal)]">
                {metrics.total_ai_requests}
              </div>
              <div className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
                Total Prompts
              </div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-amber-600">
                {metrics.requests_with_pii_intercepted}
              </div>
              <div className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
                PII Intercepted
              </div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-[var(--color-ink)]">
                {metrics.total_pii_tokens_shielded}
              </div>
              <div className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
                Tokens Redacted
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid: Sent vs. Never Sent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What is Sent */}
        <div className="notebook-card p-5 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="font-bold text-sm">What IS Sent to AI</h4>
          </div>
          <ul className="space-y-2.5 text-xs text-[var(--color-ink)]">
            {sentItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What is Never Sent */}
        <div className="notebook-card p-5 border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center gap-2 mb-3 text-rose-700 dark:text-rose-400">
            <XCircle className="w-5 h-5" />
            <h4 className="font-bold text-sm">What is NEVER Sent to AI</h4>
          </div>
          <ul className="space-y-2.5 text-xs text-[var(--color-ink)]">
            {neverSentItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
