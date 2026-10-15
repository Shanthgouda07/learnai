import React, { useEffect } from 'react'
import { Award, Clock, Flame, ArrowRight, RotateCcw, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

interface SessionSummaryProps {
  summary: {
    session_id: number
    score: number
    accuracy: number
    duration_sec: number
    streak: number
    points_breakdown: Array<{ label: string; points: number }>
    review_topics: string[]
    best_score: number
    trend: number[]
  }
  gameTitle: string
  onPlayAgain: () => void
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  summary,
  gameTitle,
  onPlayAgain,
}) => {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const isPersonalBest = summary.score >= summary.best_score && summary.score > 0

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Top Completion Card */}
      <div className="card p-8 text-center bg-gradient-to-b from-surface-card to-surface border-brand-500/30 shadow-2xl relative overflow-hidden">
        {isPersonalBest && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-3 animate-bounce">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Personal Best Score!</span>
          </div>
        )}

        <h2 className="text-2xl font-extrabold text-white mb-1">Challenge Completed!</h2>
        <p className="text-xs text-slate-400 mb-6">{gameTitle}</p>

        {/* Score & Accuracy Ring / Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-surface/80 border border-surface-border">
            <div className="text-xs text-slate-500 mb-1">Score Earned</div>
            <div className="text-3xl font-extrabold text-brand-300 font-mono">
              {summary.score}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/80 border border-surface-border">
            <div className="text-xs text-slate-500 mb-1">Accuracy</div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              {Math.round(summary.accuracy * 100)}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/80 border border-surface-border">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Time Spent</span>
            </div>
            <div className="text-2xl font-bold text-slate-300 font-mono">
              {summary.duration_sec}s
            </div>
          </div>
        </div>

        {/* Streak Badge */}
        {summary.streak > 1 && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-600/20 text-brand-300 border border-brand-600/30 text-xs font-semibold mb-6">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>{summary.streak} First-Try Streak Badge</span>
          </div>
        )}

        {/* Points Breakdown */}
        <div className="p-5 rounded-2xl bg-surface/60 border border-surface-border text-left space-y-2 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Score Breakdown
          </h4>
          {(summary.points_breakdown || []).map((b, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{b.label}</span>
              <span
                className={`font-mono font-bold ${
                  b.points > 0 ? 'text-emerald-400' : b.points < 0 ? 'text-red-400' : 'text-slate-400'
                }`}
              >
                {b.points > 0 ? `+${b.points}` : b.points} pts
              </span>
            </div>
          ))}
        </div>

        {/* Improvement Trend Sparkline (last 5 sessions) */}
        {summary.trend && summary.trend.length > 1 && (
          <div className="p-4 rounded-2xl bg-surface/40 border border-surface-border/60 text-left mb-6">
            <div className="text-[11px] text-slate-400 font-medium mb-3">
              Performance Trend (Last {summary.trend.length} sessions)
            </div>
            <div className="flex items-end gap-2 h-16 pt-2">
              {summary.trend.map((val, idx) => {
                const maxVal = Math.max(...summary.trend, 100)
                const heightPct = Math.max(15, Math.round((val / maxVal) * 100))
                const isLatest = idx === summary.trend.length - 1

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-500">{val}</span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isLatest ? 'bg-brand-500' : 'bg-surface-border'
                      }`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* What to Review Section */}
        {summary.review_topics && summary.review_topics.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-left mb-6">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Recommended Topic to Review</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              You missed items related to <strong className="text-amber-200 capitalize">{summary.review_topics[0]}</strong>. Reviewing the classroom note will solidify this concept!
            </p>
            <Link
              to="/student/notes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 hover:text-brand-200"
            >
              <span>Go to Notes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-ghost w-full sm:w-auto py-2.5 px-5 text-xs border border-surface-border"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Again</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="btn-primary w-full sm:w-auto py-2.5 px-6 text-xs"
          >
            <span>Back to Games Path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
export default SessionSummary
