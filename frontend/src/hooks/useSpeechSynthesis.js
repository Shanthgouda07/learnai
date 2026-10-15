import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useSpeechSynthesis hook
 * Reads text aloud in client browser with zero network calls (data never leaves device).
 * Splits text into sentences and highlights the sentence currently being spoken.
 */
export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1)
  const [sentences, setSentences] = useState([])
  const utteranceRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)
    }
  }, [])

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setIsPaused(false)
    setCurrentSentenceIndex(-1)
  }, [])

  const speak = useCallback((text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return

    cancel()

    // Clean markdown headings / symbols for clean speech
    const cleanText = text
      .replace(/#+\s+/g, '')
      .replace(/\*{1,2}/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, 'code snippet')

    // Split text into readable sentences
    const parsedSentences = cleanText
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (parsedSentences.length === 0) return

    setSentences(parsedSentences)
    setCurrentSentenceIndex(0)
    setIsSpeaking(true)
    setIsPaused(false)

    let index = 0

    const speakNext = () => {
      if (index >= parsedSentences.length) {
        setIsSpeaking(false)
        setCurrentSentenceIndex(-1)
        return
      }

      setCurrentSentenceIndex(index)
      const utterance = new SpeechSynthesisUtterance(parsedSentences[index])
      utterance.rate = 0.95 // Slightly slower for clear educational comprehension
      utterance.pitch = 1.0

      utterance.onend = () => {
        index++
        speakNext()
      }

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e)
        setIsSpeaking(false)
        setCurrentSentenceIndex(-1)
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }

    speakNext()
  }, [cancel])

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [])

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return {
    isSupported,
    isSpeaking,
    isPaused,
    currentSentenceIndex,
    sentences,
    speak,
    pause,
    resume,
    cancel,
  }
}
