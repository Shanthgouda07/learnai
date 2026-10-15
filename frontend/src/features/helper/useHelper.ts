import { useState, useCallback } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { SourceChipItem } from './SourceChips'

export interface HelperMessage {
  id: string
  role: 'student' | 'assistant'
  text: string
  sources?: SourceChipItem[]
  grounded?: boolean
  hintLevel?: number
  logId?: number
  helpful?: boolean | null
  timestamp: string
}

interface UseHelperOptions {
  classId?: number
  noteId?: number
  gameId?: number
  sessionId?: number
  itemId?: any
  language?: string
}

export function useHelper(options: UseHelperOptions = {}) {
  const [messages, setMessages] = useState<HelperMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your classroom AI tutor. I can give you hints and guide you through your notes and challenges step by step. What are you stuck on?",
      grounded: true,
      timestamp: new Date().toISOString(),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [hintLevel, setHintLevel] = useState<number>(1)

  const ask = useCallback(
    async (question: string, attempt?: string) => {
      if (!question.trim() || loading) return

      const userMsgId = String(Date.now())
      const userMsg: HelperMessage = {
        id: userMsgId,
        role: 'student',
        text: question.trim(),
        hintLevel,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, userMsg])
      setLoading(true)

      try {
        const payload = {
          class_id: options.classId || 1,
          note_id: options.noteId,
          game_id: options.gameId,
          session_id: options.sessionId,
          item_id: options.itemId,
          question: question.trim(),
          attempt: attempt?.trim(),
          hint_level: hintLevel,
          language: options.language || 'en',
        }

        const res = await api.post('/helper/ask', payload)
        const data = res.data

        const aiMsg: HelperMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          text: data.reply,
          sources: data.sources || [],
          grounded: data.grounded,
          hintLevel: data.hint_level,
          logId: data.log_id,
          helpful: null,
          timestamp: new Date().toISOString(),
        }

        setMessages(prev => [...prev, aiMsg])
      } catch (err: any) {
        const msg = err.response?.data?.detail || 'Unable to connect to AI tutor. Please try again.'
        toast.error(msg)
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 2),
            role: 'assistant',
            text: "I couldn't process that question right now. Your teacher's notes are still available above!",
            grounded: false,
            timestamp: new Date().toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [loading, hintLevel, options]
  )

  const submitFeedback = useCallback(async (logId: number, helpful: boolean) => {
    try {
      await api.post('/helper/feedback', { log_id: logId, helpful })
      setMessages(prev =>
        prev.map(m => (m.logId === logId ? { ...m, helpful } : m))
      )
      toast.success(helpful ? 'Thanks for the feedback! 👍' : 'Feedback noted. We will improve.')
    } catch {
      toast.error('Failed to submit feedback')
    }
  }, [])

  return {
    messages,
    loading,
    hintLevel,
    setHintLevel,
    ask,
    submitFeedback,
  }
}
export default useHelper
