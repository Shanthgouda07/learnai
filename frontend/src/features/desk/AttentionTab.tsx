import React, { useState } from 'react'
import {
  AlertTriangle, Clock, Sparkles, Check, BellOff, Eye, ChevronRight,
  Layers, Users, CheckSquare, Square, ShieldAlert, ArrowLeftRight
} from 'lucide-react'
import EvidencePopover from './EvidencePopover'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface FlagItem {
  flag_key: string
  student_id: number
  anon_id: string
  student_name?: string
  severity: 'high' | 'medium' | 'low'
  rules_fired: string[]
  reason_text: string
  evidence: Record<string, any>
  suggested_action: 'note' | 'game' | 'check_in'
  root_cause_topic?: string
}

interface AttentionTabProps {
  flags: FlagItem[]
  loading: boolean
  onGenerateSupportTask: (students: { id: number; anon_id: string; name: string }[], topic: string) => void
  onSelectStudent: (studentId: number) => void
  onRefresh: () => void
  includeDismissed: boolean
  onToggleIncludeDismissed: (val: boolean) => void
}

export default function AttentionTab({
  flags,
  loading,
  onGenerateSupportTask,
  onSelectStudent,
  onRefresh,
  includeDismissed,
  onToggleIncludeDismissed,
}: AttentionTabProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading attention alerts...</div>
  }

  const handleDismiss = async (flagKey: string) => {
    const reason = prompt('Optional reason for dismissing this flag:') || ''
    setActionInProgress(flagKey)
    try {
      await api.post(`/desk/flags/${flagKey}/dismiss`, { reason })
      toast.success('Flag dismissed.')
      onRefresh()
    } catch {
      toast.error('Failed to dismiss flag.')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleSnooze = async (flagKey: string) => {
    setActionInProgress(flagKey)
    try {
      await api.post(`/desk/flags/${flagKey}/snooze`, { reason: 'Snoozed for 7 days' })
      toast.success('Flag snoozed for 7 days.')
      onRefresh()
    } catch {
      toast.error('Failed to snooze flag.')
    } finally {
      setActionInProgress(null)
    }
  }

  // Handle group support generation for selected cards
  const handleGroupGenerate = () => {
    if (selectedKeys.length === 0) return
    const selectedFlags = flags.filter((f) => selectedKeys.includes(f.flag_key))
    const studentsToTarget = selectedFlags.map((f) => ({
      id: f.student_id,
      anon_id: f.anon_id,
      name: f.student_name || f.anon_id,
    }))
    // Use root cause of first selected
    const rootTopic = selectedFlags[0]?.root_cause_topic || 'variables'
    onGenerateSupportTask(studentsToTarget, rootTopic)
  }

  const toggleSelectKey = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter((k) => k !== key))
    } else {
      setSelectedKeys([...selectedKeys, key])
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Students Needing Support ({flags.length})</h3>
            <p className="text-xs text-slate-400">
              Evaluated strictly by deterministic rules. No student receives tasks without teacher approval.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDismissed}
              onChange={(e) => onToggleIncludeDismissed(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-brand-600 focus:ring-brand-500"
            />
            <span>Show Dismissed / Snoozed</span>
          </label>

          {selectedKeys.length > 0 && (
            <button
              type="button"
              onClick={handleGroupGenerate}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              Generate Group Task ({selectedKeys.length})
            </button>
          )}
        </div>
      </div>

      {flags.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 space-y-2">
          <ShieldAlert className="w-8 h-8 text-emerald-400 mx-auto opacity-75" />
          <h4 className="text-base font-semibold text-white">No active attention flags for this class!</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All students are meeting healthy progress benchmarks or have low-confidence sample sizes that do not trigger alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {flags.map((f) => {
            const isSelected = selectedKeys.includes(f.flag_key)
            const topic = f.evidence?.topic || f.root_cause_topic || 'topic'
            const root = f.root_cause_topic || 'topic'
            const isDifferentRoot = root !== topic && root !== 'activity'

            let severityBorder = 'border-amber-800/40 bg-slate-900/90'
            let severityBadge = 'badge-amber'
            if (f.severity === 'high') {
              severityBorder = 'border-rose-800/50 bg-slate-900/95 shadow-sm'
              severityBadge = 'badge-red'
            } else if (f.severity === 'low') {
              severityBorder = 'border-slate-800 bg-slate-900/80'
              severityBadge = 'badge-slate'
            }

            return (
              <div
                key={f.flag_key}
                className={`card p-5 border transition-all ${severityBorder} ${
                  isSelected ? 'ring-2 ring-brand-500/50' : ''
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Checkbox + Student + Reason */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelectKey(f.flag_key)}
                      className="mt-0.5 text-slate-500 hover:text-white transition-colors"
                      title="Select for group support task"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Student info + Severity chip */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectStudent(f.student_id)}
                          className="text-sm font-bold text-white hover:text-brand-300 transition-colors"
                        >
                          {f.student_name || 'Student'}
                        </button>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                          {f.anon_id}
                        </span>
                        <span className={`capitalize ${severityBadge}`}>{f.severity} priority</span>
                      </div>

                      {/* Plain deterministic reason sentence */}
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {f.reason_text}
                      </p>

                      {/* Prerequisite Chain Chips */}
                      {isDifferentRoot && (
                        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                          <span className="text-slate-500 font-medium">Prerequisite chain:</span>
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono capitalize">
                            {topic}
                          </span>
                          <span className="text-slate-600">←</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-semibold capitalize flex items-center gap-1">
                            <Layers className="w-3 h-3 text-amber-400" /> Root: {root}
                          </span>
                        </div>
                      )}

                      {/* Why Popover with exact numbers */}
                      <div className="pt-1">
                        <EvidencePopover
                          title="Rule Calculation Evidence"
                          evidence={f.evidence}
                          rulesFired={f.rules_fired}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 self-start lg:self-center">
                    <button
                      type="button"
                      onClick={() =>
                        onGenerateSupportTask(
                          [{ id: f.student_id, anon_id: f.anon_id, name: f.student_name || f.anon_id }],
                          f.root_cause_topic || 'variables'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-900/30 flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Generate Support Task
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSnooze(f.flag_key)}
                      disabled={actionInProgress === f.flag_key}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 flex items-center gap-1 transition-colors disabled:opacity-50"
                      title="Hide this alert for 7 days"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Snooze 7d
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDismiss(f.flag_key)}
                      disabled={actionInProgress === f.flag_key}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 flex items-center gap-1 transition-colors disabled:opacity-50"
                      title="Dismiss until new evidence appears"
                    >
                      <BellOff className="w-3.5 h-3.5 text-slate-400" />
                      Dismiss
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectStudent(f.student_id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Open student analytics profile"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
