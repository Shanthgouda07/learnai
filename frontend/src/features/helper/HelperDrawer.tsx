import React, { useState, useRef, useEffect } from 'react'
import {
  X, Send, Sparkles, ThumbsUp, ThumbsDown, AlertCircle,
  HelpCircle, Shield, ArrowRight, MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import useHelper from './useHelper'
import HintLevelPicker from './HintLevelPicker'
import SourceChips from './SourceChips'
import AiBadge from './AiBadge'
import ReadAloudButton from '../../components/ReadAloudButton'

interface HelperDrawerProps {
  isOpen: boolean
  onClose: () => void
  classId?: number
  noteId?: number
  gameId?: number
  sessionId?: number
  itemId?: any
  isGameSession?: boolean
}

const QUICK_PROMPTS = [
  "I'm stuck on this line",
  "Explain this concept simply",
  "Give me a similar worked example",
]

export const HelperDrawer: React.FC<HelperDrawerProps> = ({
  isOpen,
  onClose,
  classId = 1,
  noteId,
  gameId,
  sessionId,
  itemId,
  isGameSession = false,
}) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const {
    messages,
    loading,
    hintLevel,
    setHintLevel,
    ask,
    submitFeedback,
  } = useHelper({
    classId,
    noteId,
    gameId,
    sessionId,
    itemId,
  })

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, loading])

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input
    if (!q.trim() || loading) return
    ask(q)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={reducedMotion ? false : { x: '100%' }}
          animate={{ x: 0 }}
          exit={reducedMotion ? false : { x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-surface-card border-l border-surface-border shadow-2xl z-50 flex flex-col"
          aria-label="AI Study Helper"
        >
          {/* Top Header */}
          <header className="p-4 border-b border-surface-border flex items-center justify-between bg-surface/80 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-600/25 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">AI Study Helper</h2>
                  <AiBadge />
                </div>
                <p className="text-[10px] text-slate-400">
                  Grounded in your classroom notes
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
              title="Close Helper"
              aria-label="Close Helper drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 border-b border-surface-border/60 bg-surface/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(p)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] bg-slate-800/80 border border-surface-border text-slate-300 hover:text-white hover:border-brand-500/50 hover:bg-slate-700/80 transition-all shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-4"
            aria-live="polite"
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'student' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'student'
                      ? 'bg-brand-600 text-white rounded-tr-sm shadow-md'
                      : 'bg-surface border border-surface-border text-slate-200 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Sources Chips for Assistant Replies */}
                  {msg.role === 'assistant' && msg.sources && (
                    <SourceChips sources={msg.sources} />
                  )}

                  {/* Ungrounded Alert */}
                  {msg.role === 'assistant' && msg.grounded === false && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-[11px] text-amber-300">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span>Not in your notes yet</span>
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost py-0.5 px-2 text-[10px] border border-amber-500/40 text-amber-200"
                      >
                        Ask Teacher
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions & Feedback for Assistant Replies */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between gap-2 mt-1 px-1">
                    <ReadAloudButton text={msg.text} label="Listen" />
                    {msg.logId && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Helpful?</span>
                        <button
                          type="button"
                          onClick={() => submitFeedback(msg.logId!, true)}
                          className={`p-1 rounded hover:text-emerald-400 transition-colors ${
                            msg.helpful === true ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                          title="Helpful"
                          aria-label="Thumbs up"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => submitFeedback(msg.logId!, false)}
                          className={`p-1 rounded hover:text-red-400 transition-colors ${
                            msg.helpful === false ? 'text-red-400' : 'text-slate-400'
                          }`}
                          title="Not helpful"
                          aria-label="Thumbs down"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface border border-surface-border text-xs text-slate-400 max-w-[140px] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 ml-1">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Interactive Area */}
          <footer className="p-4 border-t border-surface-border bg-surface/80 space-y-3">
            {/* Hint Depth Picker */}
            <HintLevelPicker
              currentLevel={hintLevel}
              onChange={setHintLevel}
              isGameSession={isGameSession}
            />

            {/* Text Input Box */}
            <div className="relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about this step..."
                rows={2}
                maxLength={1000}
                className="w-full resize-none p-3 pr-11 bg-surface-card border border-surface-border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500/80 transition-colors"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="absolute right-2.5 bottom-3.5 p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Send question"
                aria-label="Send question"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Privacy Guarantee Footer Note */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Your name is never shared with the AI.</span>
              </span>
              <span>{input.length}/1000</span>
            </div>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
export default HelperDrawer
