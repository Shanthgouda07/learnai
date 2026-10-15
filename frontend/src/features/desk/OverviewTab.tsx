import React from 'react'
import {
  Users, Activity, Percent, AlertTriangle, TrendingUp, Sparkles,
  ArrowRight, ShieldCheck, CheckCircle2, Award
} from 'lucide-react'

interface OverviewTabProps {
  overview: any
  loading: boolean
  onTabChange: (tab: string) => void
  onSelectStudent?: (studentIdOrAnon: string) => void
}

export default function OverviewTab({
  overview,
  loading,
  onTabChange,
  onSelectStudent,
}: OverviewTabProps) {
  if (loading || !overview) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-800/40 rounded-2xl" />
      </div>
    )
  }

  const {
    student_count = 0,
    active_7d = 0,
    avg_accuracy = 0,
    flags_count = 0,
    accuracy_trend = [],
    score_distribution = [],
    class_root_causes = [],
    recent_activity = [],
    wins = [],
  } = overview

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 4 Large Calm Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-slate-900 to-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Class Roster</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{student_count}</div>
          <div className="text-xs text-slate-500 mt-1">Enrolled students</div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-slate-900 to-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active This Week</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 tracking-tight">{active_7d}</div>
          <div className="text-xs text-slate-500 mt-1">
            {student_count > 0 ? `${Math.round((active_7d / student_count) * 100)}% active in last 7 days` : 'No data'}
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-slate-900 to-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Average Accuracy</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {Math.round(avg_accuracy * 100)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all completed attempts</div>
        </div>

        <div
          onClick={() => onTabChange('attention')}
          className="card p-5 bg-gradient-to-br from-slate-900 to-amber-950/20 border-amber-900/40 hover:border-amber-700/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Needs Attention</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300 tracking-tight">{flags_count}</div>
          <div className="text-xs text-amber-400/80 mt-1 flex items-center gap-1">
            Review reasons & actions <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Class-wide Root Causes Strip */}
      {class_root_causes.length > 0 && (
        <div className="card p-6 bg-amber-950/20 border-amber-800/40">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">Class-Wide Prerequisite Blocker</h3>
          </div>
          <div className="space-y-3">
            {class_root_causes.map((rc: any) => (
              <div
                key={rc.topic}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-amber-800/30 gap-2"
              >
                <div>
                  <div className="text-sm font-semibold text-white">
                    <span className="text-amber-300 capitalize">{rc.topic}</span> prerequisite is weak for{' '}
                    <span className="font-bold text-amber-200">{rc.pct}%</span> of active students ({rc.weak_count}/{rc.student_count})
                  </div>
                  {rc.affected_topics?.length > 0 && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      Directly impacting downstream concepts:{' '}
                      <span className="text-slate-200 font-medium">
                        {rc.affected_topics.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onTabChange('attention')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold self-start sm:self-auto border border-amber-500/30 transition-colors"
                >
                  View Affected Students
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wins Strip */}
      {wins.length > 0 && (
        <div className="card p-6 bg-emerald-950/20 border-emerald-800/40">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Award className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">Wins & Improvements This Week</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {wins.map((w: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-800/30 flex items-start gap-3"
              >
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{w.student_name}</span>
                    <span className="font-mono text-[10px] text-slate-400">({w.anon_id})</span>
                  </div>
                  <p className="text-xs text-emerald-300/90 mt-0.5">{w.reason_text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Section: Accuracy Trend & Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Trend */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Class Accuracy Over Time
            </h3>
            <span className="text-xs text-slate-500">Daily average</span>
          </div>

          {accuracy_trend.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-500">
              No trend data available for this class yet.
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <div className="h-44 flex items-end gap-2 pt-4 px-2 border-b border-slate-800">
                {accuracy_trend.map((pt: any, i: number) => {
                  const heightPct = Math.max(12, Math.round(pt.accuracy * 100))
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[28px] bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-md transition-all group-hover:from-brand-500 group-hover:to-brand-300"
                      />
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-[10px] px-1.5 py-0.5 rounded text-white font-mono z-10 whitespace-nowrap">
                        {Math.round(pt.accuracy * 100)}% ({pt.sessions_count} sessions)
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 px-2 pt-1 font-mono">
                <span>{accuracy_trend[0]?.date}</span>
                <span>{accuracy_trend[accuracy_trend.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </div>

        {/* Score Distribution */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Score Distribution</h3>
            <span className="text-xs text-slate-500">Total sessions</span>
          </div>

          <div className="space-y-4 pt-1">
            {score_distribution.map((bucket: any) => {
              const totalSessions = score_distribution.reduce((acc: number, b: any) => acc + b.count, 0)
              const pct = totalSessions > 0 ? Math.round((bucket.count / totalSessions) * 100) : 0
              let barColor = 'bg-brand-500'
              if (bucket.range === '0-49%') barColor = 'bg-amber-500'
              if (bucket.range === '85-100%') barColor = 'bg-emerald-500'

              return (
                <div key={bucket.range} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{bucket.range}</span>
                    <span className="text-slate-400 font-mono">
                      {bucket.count} sessions ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Strip */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Recent Classroom Activity</h3>
          <button
            type="button"
            onClick={() => onTabChange('sessions')}
            className="text-xs text-brand-300 hover:text-brand-200"
          >
            View all sessions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/40 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Game / Challenge</th>
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {recent_activity.map((item: any) => (
                <tr key={item.session_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => onSelectStudent?.(item.anon_id)}
                      className="font-medium text-white hover:text-brand-300"
                    >
                      {item.student_name}{' '}
                      <span className="text-[10px] text-slate-500 font-mono">({item.anon_id})</span>
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{item.game_title}</td>
                  <td className="py-2.5 px-3 capitalize text-slate-400">{item.topic}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold">
                    <span className={item.accuracy < 0.5 ? 'text-amber-400' : 'text-emerald-400'}>
                      {Math.round(item.accuracy * 100)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{item.score} pts</td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
