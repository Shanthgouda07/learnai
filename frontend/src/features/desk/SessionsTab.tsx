import React, { useState, useEffect } from 'react'
import { Download, Filter, ChevronLeft, ChevronRight, Search, FileText } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface SessionsTabProps {
  classId: number
  onSelectStudent?: (studentIdOrAnon: string) => void
}

export default function SessionsTab({ classId, onSelectStudent }: SessionsTabProps) {
  const [sessions, setSessions] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [topicFilter, setTopicFilter] = useState<string>('')
  const [searchStudent, setSearchStudent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [exporting, setExporting] = useState<boolean>(false)

  const fetchSessions = async (p = 1) => {
    setLoading(true)
    try {
      let url = `/desk/classes/${classId}/sessions?page=${p}&page_size=20`
      if (topicFilter) url += `&topic=${encodeURIComponent(topicFilter)}`
      const resp = await api.get(url)
      setSessions(resp.data.sessions || [])
      setTotal(resp.data.total || 0)
      setPage(resp.data.page || 1)
      setTotalPages(resp.data.total_pages || 1)
    } catch {
      toast.error('Failed to load sessions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions(1)
  }, [classId, topicFilter])

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const resp = await api.get(`/desk/classes/${classId}/sessions?format=csv`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([resp.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `class_${classId}_sessions.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      toast.success('Sessions exported to CSV!')
    } catch {
      toast.error('CSV export failed.')
    } finally {
      setExporting(false)
    }
  }

  // Filter client-side by search query if typed
  const displayedSessions = searchStudent.trim()
    ? sessions.filter(
        (s) =>
          s.student_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
          s.anon_id.toLowerCase().includes(searchStudent.toLowerCase())
      )
    : sessions

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search student */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Search student or Anon ID..."
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 w-52"
            />
          </div>

          {/* Topic filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-brand-500"
            >
              <option value="">All Topics</option>
              <option value="variables">Variables</option>
              <option value="loops">Loops</option>
              <option value="conditionals">Conditionals</option>
              <option value="functions">Functions</option>
              <option value="lists">Lists</option>
            </select>
          </div>
        </div>

        {/* Export CSV button */}
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {exporting ? 'Exporting...' : 'Export Sessions (CSV)'}
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Session ID</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Challenge Title</th>
              <th className="py-3 px-4">Topic</th>
              <th className="py-3 px-4">Accuracy</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Hints</th>
              <th className="py-3 px-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  Loading sessions...
                </td>
              </tr>
            ) : displayedSessions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  No sessions matching filter criteria.
                </td>
              </tr>
            ) : (
              displayedSessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">#{s.id}</td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onSelectStudent?.(s.anon_id)}
                      className="font-medium text-white hover:text-brand-300 transition-colors"
                    >
                      {s.student_name}{' '}
                      <span className="text-[10px] text-slate-500 font-mono">({s.anon_id})</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-200">{s.game_title}</td>
                  <td className="py-3 px-4 capitalize text-slate-400">{s.topic}</td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    <span className={s.accuracy < 0.5 ? 'text-amber-400' : 'text-emerald-400'}>
                      {Math.round(s.accuracy * 100)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-200">
                    {s.score} / {s.max_score}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{s.duration}s</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{s.hints_used}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {s.timestamp ? new Date(s.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            Total: <strong className="text-white">{total}</strong> sessions
          </span>
          <div className="flex items-center gap-2">
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => fetchSessions(page - 1)}
              disabled={page <= 1}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fetchSessions(page + 1)}
              disabled={page >= totalPages}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
