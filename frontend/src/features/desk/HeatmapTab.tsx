import React, { useState } from 'react'
import { ArrowUpDown, HelpCircle, User as UserIcon, ShieldAlert, Sparkles, Table, LayoutGrid } from 'lucide-react'

interface HeatmapCell {
  student_id: number
  topic: string
  mastery: number | null
  confidence: 'ok' | 'low' | 'none'
  attempts?: number
  trend?: string
}

interface StudentItem {
  id: number
  anon_id: string
  name: string
}

interface HeatmapTabProps {
  data: {
    students: StudentItem[]
    topics: string[]
    cells: HeatmapCell[]
  }
  loading: boolean
  onSelectStudentTopic?: (studentId: number, topic: string) => void
}

export default function HeatmapTab({
  data,
  loading,
  onSelectStudentTopic,
}: HeatmapTabProps) {
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortAsc, setSortAsc] = useState<boolean>(true)
  const [viewMode, setViewMode] = useState<'heatmap' | 'table'>('heatmap')

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading class heatmap...</div>
  }

  const { students = [], topics = [], cells = [] } = data

  // Lookup helper: (student_id, topic) -> cell
  const cellMap: Record<string, HeatmapCell> = {}
  cells.forEach((c) => {
    cellMap[`${c.student_id}_${c.topic}`] = c
  })

  // Compute student average mastery for sorting
  const studentStats: Record<number, { avgMastery: number; withData: number }> = {}
  students.forEach((s) => {
    let total = 0
    let count = 0
    topics.forEach((t) => {
      const cell = cellMap[`${s.id}_${t}`]
      if (cell && cell.mastery !== null) {
        total += cell.mastery
        count++
      }
    })
    studentStats[s.id] = {
      avgMastery: count > 0 ? total / count : -1,
      withData: count,
    }
  })

  // Sorting
  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'name') {
      const res = a.name.localeCompare(b.name)
      return sortAsc ? res : -res
    }
    if (sortBy === 'overall') {
      const aVal = studentStats[a.id]?.avgMastery ?? -1
      const bVal = studentStats[b.id]?.avgMastery ?? -1
      return sortAsc ? aVal - bVal : bVal - aVal
    }
    // Topic sort
    const aCell = cellMap[`${a.id}_${sortBy}`]?.mastery ?? -1
    const bCell = cellMap[`${b.id}_${sortBy}`]?.mastery ?? -1
    return sortAsc ? aCell - bCell : bCell - aCell
  })

  const handleHeaderClick = (key: string) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(key)
      setSortAsc(false)
    }
  }

  // Color palette: sequential emerald/teal for colorblind accessibility
  // mastery < 0.5 is warm amber/rose, >= 0.5 is progressive teal/emerald
  const getCellStyles = (cell?: HeatmapCell) => {
    if (!cell || cell.mastery === null || cell.confidence === 'none') {
      return {
        bg: 'bg-hatched text-slate-500 border-slate-800/80',
        label: 'No Data',
        isNoData: true,
      }
    }

    const m = cell.mastery
    const isLowConf = cell.confidence === 'low'
    const opacityClass = isLowConf ? 'opacity-55' : 'opacity-100'

    if (m < 0.40) {
      return {
        bg: `bg-rose-950/70 border-rose-800/50 text-rose-200 ${opacityClass}`,
        label: `${Math.round(m * 100)}%`,
        isNoData: false,
      }
    }
    if (m < 0.55) {
      return {
        bg: `bg-amber-950/60 border-amber-800/50 text-amber-200 ${opacityClass}`,
        label: `${Math.round(m * 100)}%`,
        isNoData: false,
      }
    }
    if (m < 0.75) {
      return {
        bg: `bg-teal-900/50 border-teal-700/50 text-teal-200 ${opacityClass}`,
        label: `${Math.round(m * 100)}%`,
        isNoData: false,
      }
    }
    return {
      bg: `bg-emerald-900/60 border-emerald-700/60 text-emerald-200 ${opacityClass}`,
      label: `${Math.round(m * 100)}%`,
      isNoData: false,
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Legend & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 notebook-card">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Student Mastery Grid</h3>
            <button
              type="button"
              onClick={() => setViewMode(v => v === 'heatmap' ? 'table' : 'heatmap')}
              className="notebook-btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 touch-target"
              aria-label={`Switch view. Currently viewing ${viewMode}.`}
            >
              {viewMode === 'heatmap' ? <Table className="w-3.5 h-3.5 text-[var(--color-teal)]" /> : <LayoutGrid className="w-3.5 h-3.5 text-[var(--color-teal)]" />}
              <span>{viewMode === 'heatmap' ? 'View as Table' : 'View as Heatmap'}</span>
            </button>
          </div>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            Click any cell to drill into prerequisite chains and practice sessions for that topic.
          </p>
        </div>

        {/* Sequential Palette Legend */}
        {viewMode === 'heatmap' && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-ink)]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-hatched border border-[var(--color-border)] inline-block" />
              <span className="text-[11px] text-[var(--color-ink-muted)]">No Data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-900/70 border border-rose-700 inline-block" />
              <span className="text-[11px] text-rose-500 font-medium">&lt;40% (Needs Support)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-900/60 border border-amber-700 inline-block" />
              <span className="text-[11px] text-amber-500 font-medium">40-55%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-teal-900/60 border border-teal-700 inline-block" />
              <span className="text-[11px] text-[var(--color-teal)] font-medium">55-75%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-900/70 border border-emerald-700 inline-block" />
              <span className="text-[11px] text-emerald-500 font-medium">75%+</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-[var(--color-border)] pl-2">
              <span className="w-3.5 h-3.5 rounded bg-teal-900/30 border border-dashed border-teal-600 inline-block" />
              <span className="text-[11px] text-[var(--color-ink-muted)]">Lighter = Low Conf</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid Table */}
      <div className="card overflow-x-auto border-slate-800">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400">
              <th
                onClick={() => handleHeaderClick('name')}
                className="py-3.5 px-4 font-semibold text-white sticky left-0 bg-slate-900 z-10 cursor-pointer select-none hover:text-brand-300"
              >
                <div className="flex items-center gap-1.5">
                  <span>Student</span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>

              {topics.map((t) => (
                <th
                  key={t}
                  onClick={() => handleHeaderClick(t)}
                  className="py-3.5 px-3 font-semibold capitalize text-center cursor-pointer select-none hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{t}</span>
                    {sortBy === t && (
                      <span className="text-brand-400 font-mono text-[10px]">
                        {sortAsc ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              <th
                onClick={() => handleHeaderClick('overall')}
                className="py-3.5 px-3 font-semibold text-center cursor-pointer select-none hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Overall</span>
                  {sortBy === 'overall' && (
                    <span className="text-brand-400 font-mono text-[10px]">
                      {sortAsc ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-sans">
            {sortedStudents.map((st) => {
              const avgObj = studentStats[st.id]
              const avgMastery = avgObj?.avgMastery ?? -1

              return (
                <tr key={st.id} className="hover:bg-slate-800/20 transition-colors">
                  {/* Student Name & Anon ID Chip */}
                  <td className="py-3 px-4 font-medium sticky left-0 bg-slate-900/95 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{st.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/80 text-[10px] font-mono text-slate-400">
                        {st.anon_id}
                      </span>
                    </div>
                  </td>

                  {/* Topic Cells */}
                  {topics.map((t) => {
                    const cell = cellMap[`${st.id}_${t}`]
                    const styling = getCellStyles(cell)
                    const ariaLabel = styling.isNoData
                      ? `${st.name}, topic ${t}: No completed sessions.`
                      : `${st.name}, topic ${t}: ${Math.round((cell?.mastery || 0) * 100)} percent mastery, ${cell?.confidence === 'low' ? 'low confidence' : 'ok confidence'}, ${cell?.attempts || 0} attempts.`

                    if (viewMode === 'table') {
                      return (
                        <td key={t} className="p-2 text-center border-l border-[var(--color-border)]">
                          <button
                            type="button"
                            onClick={() => onSelectStudentTopic?.(st.id, t)}
                            aria-label={ariaLabel}
                            className="w-full text-xs hover:underline focus:underline text-[var(--color-ink)]"
                          >
                            {styling.isNoData ? (
                              <span className="text-[var(--color-ink-muted)]">No data</span>
                            ) : (
                              <span className="font-semibold">
                                {Math.round((cell?.mastery || 0) * 100)}% ({cell?.confidence === 'low' ? 'Low Conf' : 'OK'}, {cell?.attempts || 0} att.)
                              </span>
                            )}
                          </button>
                        </td>
                      )
                    }

                    return (
                      <td key={t} className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectStudentTopic?.(st.id, t)}
                          aria-label={ariaLabel}
                          title={
                            styling.isNoData
                              ? 'No completed sessions on this topic'
                              : cell?.confidence === 'low'
                              ? `Low Confidence (< 2 sessions or < 3 items). Click to view details.`
                              : `${Math.round((cell?.mastery || 0) * 100)}% mastery (${cell?.attempts} sessions, trend: ${cell?.trend}). Click to view details.`
                          }
                          className={`w-full py-2.5 px-2 rounded-xl border text-xs font-mono font-medium transition-transform hover:scale-[1.03] active:scale-95 ${styling.bg}`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>{styling.label}</span>
                            {cell?.confidence === 'low' && !styling.isNoData && (
                              <span className="text-[10px] opacity-80" title="Low confidence sample">
                                *
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                    )
                  })}

                  {/* Overall Avg */}
                  <td className="p-1.5 text-center font-mono text-xs">
                    {avgMastery >= 0 ? (
                      <span className="font-bold text-white">
                        {Math.round(avgMastery * 100)}%
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
