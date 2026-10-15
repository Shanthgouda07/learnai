import React from 'react'
import {
  Layers, CheckCircle2, Clock, TrendingUp, TrendingDown,
  Sparkles, Minus, ArrowRight, User as UserIcon
} from 'lucide-react'

interface InterventionItem {
  id: number
  topic: string
  kind: string
  draft_id: number
  student_ids: number[]
  student_anon_ids: string[]
  before_mastery: number
  after_mastery: number | null
  status: 'pending' | 'completed' | 'improved' | 'declined' | 'no_change'
  created_at: string
}

interface InterventionsTabProps {
  interventions: InterventionItem[]
  loading: boolean
  onSelectStudent?: (studentIdOrAnon: string) => void
}

export default function InterventionsTab({
  interventions,
  loading,
  onSelectStudent,
}: InterventionsTabProps) {
  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading assigned interventions...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Support Tasks &amp; Outcomes (&quot;Did it help?&quot;)</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track whether targeted notes and games helped students improve on the root cause topic.
          </p>
        </div>
        <span className="badge-brand font-mono">{interventions.length} Assigned</span>
      </div>

      {interventions.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 space-y-2">
          <Layers className="w-8 h-8 text-slate-500 mx-auto opacity-60" />
          <h4 className="text-base font-semibold text-white">No support tasks assigned yet.</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you approve and assign a targeted support task from the Needs Attention tab, its before and after mastery progress will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {interventions.map((it) => {
            const beforePct = Math.round(it.before_mastery * 100)
            const afterPct = it.after_mastery !== null ? Math.round(it.after_mastery * 100) : null
            const hasCompleted = afterPct !== null
            const gain = hasCompleted ? afterPct - beforePct : 0

            let statusBadge = 'badge-amber'
            let statusLabel = 'In Progress (Pending)'
            if (it.status === 'improved') {
              statusBadge = 'badge-green'
              statusLabel = `Improved (+${gain}%)`
            } else if (it.status === 'completed') {
              statusBadge = 'badge-brand'
              statusLabel = 'Completed'
            } else if (it.status === 'declined') {
              statusBadge = 'badge-red'
              statusLabel = `Declined (${gain}%)`
            }

            return (
              <div key={it.id} className="card p-5 border border-slate-800 bg-slate-900/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="badge-slate capitalize font-semibold text-white">
                      {it.kind}
                    </span>
                    <span className="text-sm font-bold text-white capitalize">
                      {it.topic} Review
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">#{it.id}</span>
                  </div>
                  <span className={statusBadge}>{statusLabel}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  {/* Target students */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Assigned to:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {it.student_anon_ids.map((anon) => (
                        <button
                          key={anon}
                          type="button"
                          onClick={() => onSelectStudent?.(anon)}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-brand-300 font-mono text-[10px] hover:bg-slate-700 transition-colors"
                        >
                          {anon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Before vs After Indicator */}
                  <div className="flex items-center gap-3 text-xs bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
                    <div className="text-slate-400">
                      Before:{' '}
                      <span className="font-mono font-bold text-slate-200">{beforePct}%</span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

                    <div className="text-slate-400">
                      After:{' '}
                      {afterPct !== null ? (
                        <span
                          className={`font-mono font-bold ${
                            gain > 0
                              ? 'text-emerald-400'
                              : gain < 0
                              ? 'text-rose-400'
                              : 'text-slate-200'
                          }`}
                        >
                          {afterPct}%
                        </span>
                      ) : (
                        <span className="text-amber-400 font-mono italic">Pending play</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>
                    Assigned on {new Date(it.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <span>Visible exclusively to targeted student account(s)</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
