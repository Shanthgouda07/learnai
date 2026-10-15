import React, { useEffect, useState } from 'react'
import {
  Sparkles, ShieldCheck, AlertTriangle, Clock, CheckCircle2,
  Filter, Search, ThumbsUp, ThumbsDown, Database, Cpu
} from 'lucide-react'
import api from '../../services/api'
import AiBadge from '../../features/helper/AiBadge'

interface AILogItem {
  id: number
  kind: string
  user_anon_id: string
  user_role: string
  class_id: number
  prompt: string
  response: string
  sources: Array<{ note_title: string; heading?: string }>
  removed_counts: Array<{ type: string; count: number }>
  blocked: boolean
  block_reason?: string | null
  helpful?: boolean | null
  timestamp: string
}

interface AIStatus {
  rag_backend: string
  llm_mode: string
}

export const TeacherAIActivity: React.FC = () => {
  const [logs, setLogs] = useState<AILogItem[]>([])
  const [status, setStatus] = useState<AIStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBlocked, setFilterBlocked] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/ai/activity'),
      api.get('/ai/status'),
    ])
      .then(([actRes, statRes]) => {
        setLogs(actRes.data)
        setStatus(statRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.response.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_anon_id.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterBlocked) {
      return matchesSearch && log.blocked
    }
    return matchesSearch
  })

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>AI Activity & Transparency Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of all AI interactions. Student privacy is strictly preserved.
          </p>
        </div>

        {/* System Status Chips */}
        {status && (
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
              <Database className="w-3 h-3 text-teal-400" />
              <span>RAG: {status.rag_backend.toUpperCase()}</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
              <Cpu className="w-3 h-3 text-brand-400" />
              <span>LLM: {status.llm_mode.toUpperCase()}</span>
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search prompt, answer or anon ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-card border border-surface-border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterBlocked(!filterBlocked)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              filterBlocked
                ? 'bg-red-500/20 border-red-500/60 text-red-300'
                : 'bg-surface-card border-surface-border text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Blocked Only</span>
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Loading audit logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card p-12 text-center text-slate-400 text-xs">
          No AI interaction logs match your search.
        </div>
      ) : (
        <div className="card overflow-hidden bg-surface-card border-surface-border shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 border-b border-surface-border text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Kind</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Anonymized Prompt</th>
                  <th className="py-3 px-4">AI Response</th>
                  <th className="py-3 px-4">Sources Cited</th>
                  <th className="py-3 px-4 text-center">Safety</th>
                  <th className="py-3 px-4 text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-hover/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Kind */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="badge badge-brand text-[10px] capitalize">
                        {log.kind.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Anonymous User ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-300">
                        {log.user_anon_id}
                      </span>
                    </td>

                    {/* Prompt */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="truncate text-slate-300" title={log.prompt}>
                        {log.prompt}
                      </p>
                    </td>

                    {/* Response */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="truncate text-slate-300" title={log.response}>
                        {log.response}
                      </p>
                    </td>

                    {/* Sources */}
                    <td className="py-3.5 px-4 max-w-[160px]">
                      {log.sources && log.sources.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {log.sources.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-teal-300 border border-teal-500/30 truncate max-w-[140px]"
                            >
                              {s.note_title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">None</span>
                      )}
                    </td>

                    {/* Safety Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      {log.blocked ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40"
                          title={log.block_reason || 'Blocked by guard'}
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Blocked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Passed</span>
                        </span>
                      )}
                    </td>

                    {/* Feedback rating */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      {log.helpful === true ? (
                        <span className="text-emerald-400" title="Student voted Helpful">
                          <ThumbsUp className="w-3.5 h-3.5 mx-auto" />
                        </span>
                      ) : log.helpful === false ? (
                        <span className="text-red-400" title="Student voted Not Helpful">
                          <ThumbsDown className="w-3.5 h-3.5 mx-auto" />
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
export default TeacherAIActivity
