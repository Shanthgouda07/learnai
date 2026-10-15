import { useState, useEffect, useCallback, useRef } from 'react'

export interface TraceStep {
  step: number
  event: 'line' | 'call' | 'return' | 'exception'
  line: number
  func: string
  locals: Record<string, any>
  globals: Record<string, any>
  call_stack: Array<{ func: string; line: number; locals: Record<string, any> }>
  stdout: string
  return_value: any | null
  changed: string[]
}

export function usePlayback(steps: TraceStep[] = []) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<number>(1) // 0.5, 1, 2, 4
  const stepsRef = useRef(steps)
  stepsRef.current = steps

  // Reset index when steps array changes
  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [steps])

  const next = useCallback(() => {
    setIndex(prev => {
      if (prev < stepsRef.current.length - 1) {
        return prev + 1
      }
      setPlaying(false)
      return prev
    })
  }, [])

  const prev = useCallback(() => {
    setIndex(prev => Math.max(0, prev - 1))
  }, [])

  const seek = useCallback((targetIndex: number) => {
    const clamped = Math.max(0, Math.min(stepsRef.current.length - 1, targetIndex))
    setIndex(clamped)
  }, [])

  const restart = useCallback(() => {
    setIndex(0)
    setPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    if (stepsRef.current.length <= 1) return
    setPlaying(p => {
      if (!p && index >= stepsRef.current.length - 1) {
        setIndex(0)
        return true
      }
      return !p
    })
  }, [index])

  // Playback timer
  useEffect(() => {
    if (!playing) return

    const intervalMs = Math.round(1000 / speed)
    const timer = setInterval(() => {
      setIndex(prev => {
        if (prev < stepsRef.current.length - 1) {
          return prev + 1
        }
        setPlaying(false)
        return prev
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [playing, speed])

  // Global Keyboard shortcuts: Space (play/pause), ArrowLeft (prev), ArrowRight (next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input, textarea, or Monaco editor
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('.monaco-editor'))
      ) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        next()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, prev, next])

  const currentStep = steps[index] || null

  return {
    index,
    totalSteps: steps.length,
    currentStep,
    playing,
    speed,
    next,
    prev,
    seek,
    restart,
    togglePlay,
    setSpeed,
  }
}
