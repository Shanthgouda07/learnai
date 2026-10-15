import React, { useState, useEffect } from 'react'
import {
  ArrowLeft, Sparkles, TrendingUp, TrendingDown, Minus, Layers,
  Calendar, Award, BookOpen, Clock, ShieldCheck, CheckCircle2, User as UserIcon
} from 'lucide-react'
import api from '../../services/api'
import EvidencePopover from './EvidencePopover'
import toast from 'react-hot-toast'

interface StudentDetailPageProps {
  studentId: number
  classId: number
  onBack: () => void
  onGenerateSupportTask: (students: { id: number; anon_id: string; name: string }[], topic: string) => void
}

export default function StudentDetailPage({
  studentId,
  classId,
  onBack,
  onGenerateSupportTask,
}: StudentDetailPageProps) {
  const [detail, setDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [aiSummary, setAiSummary] = useState<any>(null)

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const resp = await api.get(`/desk/students/${studentId}?class_id=${classId}`)
      setDetail(resp.data)
    } catch {
      toast.error('Failed to load student details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [studentId, classId])

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true)
    try {
      const resp = await api.post(`/desk/students/${studentId}/summary?class_id=${classId}`)
      setAiSummary(resp.data)
      toast.success('AI Progress Summary generated!')
    } catch {
      toast.error('Failed to generate summary.')
    } finally {
      setGeneratingSummary(false)
    }
  }

  if (loading || !detail) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading student profile...</div>
  }

  const {
    student = {},
    score_history = [],
    topic_mastery = {},
    sessions = [],
    prerequisite_chains = [],
    enrollments_across_classes = [],
  } = detail

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button and Student header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white">{student.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-brand-300">
                {student.anon_id}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Enrolled in:</span>
              {enrollments_across_classes.map((c: any) => (
                <span key={c.class_id} className="badge-slate font-sans">
                  {c.class_name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action to create targeted task */}
        <button
          type="button"
          onClick={() =>
            onGenerateSupportTask(
              [{ id: student.id, anon_id: student.anon_id, name: student.name }],
              prerequisite_chains[0]?.root || 'variables'
            )
          }
          className="btn-primary text-xs py-2 px-4 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Generate Support Task
        </button>
      </div>

      {/* AI Progress Summary Card */}
      <div className="card p-6 bg-gradient-to-br from-slate-900 to-indigo-950/20 border-indigo-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <h3 className="text-base font-bold text-white">AI Progress Summary</h3>
            <span className="badge-brand">AI-Generated</span>
          </div>

          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={generatingSummary}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            {generatingSummary ? 'Synthesizing...' : aiSummary ? 'Regenerate Summary' : 'Generate Summary'}
          </button>
        </div>

        {aiSummary ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {aiSummary.summary}
            </p>
            {aiSummary.why_this_summary?.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <EvidencePopover
                  title="Why this summary?"
                  evidence={aiSummary.evidence}
                  rulesFired={aiSummary.why_this_summary}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Click &quot;Generate Summary&quot; to synthesize a private 3-4 sentence plain language progress report grounded purely in numeric session data.
          </p>
        )}
      </div>

      {/* Topic Mastery Bars & Prerequisite Chains */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-white mb-4">Topic Mastery Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(topic_mastery).map(([topicName, mInfo]: [string, any]) => {
            const hasData = mInfo && mInfo.mastery !== null
            const masteryVal = hasData ? mInfo.mastery : 0
            const pct = Math.round(masteryVal * 100)
            const isWeak = hasData && masteryVal < 0.5
            const trend = mInfo?.trend || 'steady'

            return (
              <div
                key={topicName}
                className={`p-4 rounded-xl border ${
                  isWeak ? 'bg-amber-950/10 border-amber-800/40' : 'bg-slate-900 border-slate-800'
                } space-y-2.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white capitalize">{topicName}</span>
                    {mInfo?.confidence === 'low' && (
                      <span className="badge-slate text-[10px]">Low Confidence Sample</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {trend === 'improving' && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <TrendingUp className="w-3.5 h-3.5" /> Improving
                      </span>
                    )}
                    {trend === 'declining' && (
                      <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                        <TrendingDown className="w-3.5 h-3.5" /> Declining
                      </span>
                    )}
                    {trend === 'steady' && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Minus className="w-3.5 h-3.5" /> Steady
                      </span>
                    )}
                    <span className="font-mono text-sm font-bold text-white">
                      {hasData ? `${pct}%` : 'No Data'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      !hasData
                        ? 'bg-transparent'
                        : isWeak
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>{mInfo?.attempts || 0} completed session(s)</span>
                  <span>
                    Last played:{' '}
                    {mInfo?.last_played
                      ? new Date(mInfo.last_played).toLocaleDateString([], { month: 'short', day: 'numeric' })
                      : 'None'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Prerequisite Root Cause Tracing */}
        {prerequisite_chains.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              Detected Prerequisite Blocker(s)
            </h4>
            <div className="space-y-2">
              {prerequisite_chains.map((chain: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-slate-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="capitalize font-semibold text-white">{chain.target_topic}</span>
                    <span className="text-slate-500">is hindered by</span>
                    <span className="capitalize font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                      {chain.root}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onGenerateSupportTask(
                        [{ id: student.id, anon_id: student.anon_id, name: student.name }],
                        chain.root
                      )
                    }
                    className="text-xs text-brand-300 hover:text-white font-medium underline"
                  >
                    Target {chain.root} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Score History Chart & Sessions Table */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-white mb-4">Recent Sessions History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/40 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Challenge Title</th>
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Hints</th>
                <th className="py-2.5 px-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {score_history.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-slate-400">
                    {s.timestamp ? new Date(s.timestamp).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-white font-medium">{s.game_title}</td>
                  <td className="py-2.5 px-3 capitalize text-slate-400">{s.topic}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold">
                    <span className={s.accuracy < 0.5 ? 'text-amber-400' : 'text-emerald-400'}>
                      {Math.round(s.accuracy * 100)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {s.score} / {s.max_score}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{s.hints_used}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{s.duration}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
