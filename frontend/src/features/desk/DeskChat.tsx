import React, { useState } from 'react'
import { MessageSquare, Send, Sparkles, X, User as UserIcon, ShieldCheck } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface DeskChatProps {
  classId: number
  onSelectStudent?: (studentIdOrAnon: string) => void
}

interface Message {
  sender: 'user' | 'assistant'
  text: string
  intent?: string
  evidence?: any
}

const SUGGESTIONS = [
  'Who struggled with loops this week?',
  'Who has been inactive?',
  'Who showed the biggest improvement?',
  'Which topic should I reteach?',
]

export default function DeskChat({ classId, onSelectStudent }: DeskChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Hello! I am your AI Desk Assistant. Ask me anything about student performance, topic masteries, activity flags, or prerequisite chains.',
    },
  ])

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim()
    if (!q || loading) return

    setMessages((prev) => [...prev, { sender: 'user', text: q }])
    if (!questionText) setInput('')
    setLoading(true)

    try {
      const resp = await api.post(`/desk/classes/${classId}/chat`, { question: q })
      const data = resp.data
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.reply,
          intent: data.intent,
          evidence: data.evidence,
        },
      ])
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Chat query failed.')
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I could not process that request. Please try asking about topic performance or inactive students.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-950/60 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>Ask the Desk</span>
        </button>
      )}

      {/* Floating Modal / Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[540px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-brand-500/10 text-brand-400">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">Ask the AI Desk</h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Grounded in deterministic data
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    m.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>

                {/* Clickable student chips if mentioned in text or evidence */}
                {m.sender === 'assistant' && (
                  <div className="flex flex-wrap gap-1 mt-1.5 ml-1">
                    {['S-001', 'S-002', 'S-004', 'S-007', 'S-009', 'S-011'].map((anon) => {
                      if (m.text.includes(anon)) {
                        return (
                          <button
                            key={anon}
                            type="button"
                            onClick={() => onSelectStudent?.(anon)}
                            className="px-2 py-0.5 rounded-full bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-mono flex items-center gap-1 transition-colors"
                          >
                            <UserIcon className="w-2.5 h-2.5" /> View {anon}
                          </button>
                        )
                      }
                      return null
                    })}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2 italic">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-brand-400" />
                Querying classroom records...
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/60 overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(sug)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white transition-colors flex-shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about performance, topics..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
