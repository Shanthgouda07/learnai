/**
 * Teacher AI Desk – analytics, attention flags, support task generation.
 */
import { useEffect, useState } from 'react'
import { Brain, AlertTriangle, Sparkles, MessageSquare, Send } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function TeacherDesk() {
  const [students, setStudents]       = useState([])
  const [selected, setSelected]       = useState(null)
  const [taskType, setTaskType]       = useState('note')
  const [weakTopic, setWeakTopic]     = useState('')
  const [generating, setGenerating]   = useState(false)
  const [generatedTask, setGeneratedTask] = useState(null)
  const [chatQ, setChatQ]             = useState('')
  const [chatAnswer, setChatAnswer]   = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    api.get('/analytics/class-overview')
       .then(r => setStudents(r.data))
       .catch(console.error)
       .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async () => {
    if (!selected || !weakTopic.trim()) {
      toast.error('Select a student and enter a weak topic')
      return
    }
    setGenerating(true)
    try {
      const { data } = await api.post(
        `/analytics/generate-support-task?anon_id=${selected.anon_id}&weak_topic=${encodeURIComponent(weakTopic)}&task_type=${taskType}`
      )
      setGeneratedTask(data.content)
    } catch {
      toast.error('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleChat = async () => {
    if (!chatQ.trim()) return
    setChatLoading(true)
    try {
      const { data } = await api.post(`/analytics/teacher-chat?question=${encodeURIComponent(chatQ)}`)
      setChatAnswer(data.answer)
    } catch {
      toast.error('Chat failed')
    } finally {
      setChatLoading(false)
    }
  }

  const needsAttention = students.filter(s => s.needs_attention)

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <Brain className="w-7 h-7 text-brand-400" /> Teacher AI Desk
        </h1>
        <p className="text-slate-500 mt-1">Identify struggling students and generate targeted support</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: student flags + task generator */}
        <div className="space-y-6">
          {/* Attention flags */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Needs Attention
            </h2>
            {loading ? (
              <div className="text-slate-500 text-sm">Loading…</div>
            ) : needsAttention.length === 0 ? (
              <div className="text-slate-500 text-sm">All students are on track 🎉</div>
            ) : (
              <div className="space-y-2">
                {needsAttention.map(s => (
                  <button
                    key={s.anon_id}
                    id={`select-student-${s.anon_id}`}
                    onClick={() => { setSelected(s); setWeakTopic('') }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selected?.anon_id === s.anon_id
                        ? 'bg-red-500/10 border-red-600/40'
                        : 'bg-red-500/5 border-red-600/20 hover:bg-red-500/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-white">{s.anon_id}</div>
                        <div className="text-xs text-red-300 mt-0.5">{s.attention_reason}</div>
                      </div>
                      <span className="badge-red">{(s.avg_accuracy * 100).toFixed(0)}%</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Support task generator */}
          <div className="card p-6 border-brand-600/20">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-brand-400" /> Generate Support Task
            </h2>

            {selected ? (
              <div className="mb-3 p-3 bg-brand-600/10 border border-brand-600/30 rounded-xl text-sm">
                Generating for: <span className="text-brand-300 font-semibold">{selected.anon_id}</span>
              </div>
            ) : (
              <div className="mb-3 text-sm text-slate-500">
                Select a student from the list above
              </div>
            )}

            <input
              id="weak-topic-input"
              className="input mb-3"
              placeholder="Weak topic, e.g. 'for loops'"
              value={weakTopic}
              onChange={e => setWeakTopic(e.target.value)}
            />

            <div className="flex gap-2 mb-4">
              {['note', 'game'].map(t => (
                <button
                  key={t}
                  id={`task-type-${t}`}
                  onClick={() => setTaskType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    taskType === t
                      ? 'bg-brand-600/20 border-brand-600/40 text-brand-300'
                      : 'bg-transparent border-surface-border text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'note' ? '📄 Note' : '🎮 Game'}
                </button>
              ))}
            </div>

            <button
              id="generate-task-btn"
              className="btn-primary w-full justify-center"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Sparkles className="w-4 h-4" />}
              Generate Task (AI Draft)
            </button>

            {generatedTask && (
              <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl animate-slide-up">
                <div className="badge-amber mb-3"><Sparkles className="w-3 h-3" /> AI Draft – Review Required</div>
                <h3 className="text-white font-semibold mb-2">{generatedTask.title}</h3>
                {generatedTask.content && (
                  <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans line-clamp-8">
                    {generatedTask.content}
                  </pre>
                )}
                {generatedTask.content_json && (
                  <pre className="text-xs text-slate-400 font-mono line-clamp-6">
                    {typeof generatedTask.content_json === 'string'
                      ? generatedTask.content_json
                      : JSON.stringify(generatedTask.content_json, null, 2)}
                  </pre>
                )}
                <div className="flex gap-2 mt-3">
                  <button className="btn-primary text-xs py-1.5 px-3">Approve & Assign</button>
                  <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => setGeneratedTask(null)}>Discard</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: teacher chat */}
        <div className="card p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-brand-400" /> Ask About Your Class
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Ask questions like "Who struggled with loops this week?" — answers are based on session data only.
          </p>

          <div className="flex-1 min-h-32 bg-surface rounded-xl border border-surface-border p-4 mb-4 text-sm text-slate-300 overflow-auto">
            {chatAnswer || <span className="text-slate-600">Answer will appear here…</span>}
          </div>

          <div className="flex gap-3">
            <input
              id="teacher-chat-input"
              className="input flex-1"
              placeholder="Ask about student performance…"
              value={chatQ}
              onChange={e => setChatQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
            />
            <button
              id="teacher-chat-send"
              className="btn-primary px-3"
              onClick={handleChat}
              disabled={chatLoading}
            >
              {chatLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
