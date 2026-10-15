import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export interface ItemFeedback {
  correct: boolean
  feedback: string
  explanation?: string | null
}

export function useGameSession(gameId: number | string) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [gameTitle, setGameTitle] = useState('')
  const [gameType, setGameType] = useState('')
  const [maxPoints, setMaxPoints] = useState(100)
  const [clientContent, setClientContent] = useState<any>(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [durationSec, setDurationSec] = useState(0)
  const [itemFeedback, setItemFeedback] = useState<Record<string, ItemFeedback>>({})
  const [isFinished, setIsFinished] = useState(false)
  const [finishSummary, setFinishSummary] = useState<any>(null)
  const timerRef = useRef<any>(null)

  // Start game session on mount
  useEffect(() => {
    if (!gameId) return
    setLoading(true)
    setError(null)

    api.post(`/games/${gameId}/start`)
      .then(res => {
        const data = res.data
        setSessionId(data.session_id)
        setGameTitle(data.title)
        setGameType(data.game_type)
        setMaxPoints(data.max_points)
        setClientContent(data.content)
      })
      .catch(err => {
        const msg = err.response?.data?.detail || 'Failed to start game session'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [gameId])

  // Timer
  useEffect(() => {
    if (isFinished || loading || error) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setDurationSec(d => d + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isFinished, loading, error])

  // Submit per-item answer
  const submitAnswer = useCallback(
    async (itemId: string | number, response: any): Promise<ItemFeedback | null> => {
      if (!sessionId) return null

      try {
        const res = await api.post(`/games/${gameId}/answer`, {
          session_id: sessionId,
          item_id: itemId,
          response,
        })
        const feedback: ItemFeedback = res.data
        setItemFeedback(prev => ({
          ...prev,
          [String(itemId)]: feedback,
        }))
        return feedback
      } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Failed to submit answer')
        return null
      }
    },
    [sessionId, gameId]
  )

  // Reveal hint
  const useHint = useCallback(() => {
    setHintsUsed(h => h + 1)
  }, [])

  // Finish session
  const finishSession = useCallback(async () => {
    if (!sessionId || isFinished) return

    try {
      const res = await api.post(`/games/${gameId}/finish`, {
        session_id: sessionId,
        duration_sec: durationSec,
        hints_used: hintsUsed,
      })
      setFinishSummary(res.data)
      setIsFinished(true)
      return res.data
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to finish session')
      return null
    }
  }, [sessionId, gameId, durationSec, hintsUsed, isFinished])

  return {
    loading,
    error,
    sessionId,
    gameTitle,
    gameType,
    maxPoints,
    clientContent,
    hintsUsed,
    durationSec,
    itemFeedback,
    isFinished,
    finishSummary,
    submitAnswer,
    useHint,
    finishSession,
  }
}
export default useGameSession
