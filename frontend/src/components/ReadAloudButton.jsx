import React from 'react'
import { Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

export default function ReadAloudButton({ text, label = 'Listen' }) {
  const { isSupported, isSpeaking, isPaused, speak, pause, resume, cancel } = useSpeechSynthesis()

  if (!isSupported || !text) return null

  if (isSpeaking) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-[var(--color-teal-wash)] border border-[var(--color-teal)] rounded-xl px-2.5 py-1 text-xs">
        {isPaused ? (
          <button
            onClick={resume}
            aria-label="Resume reading aloud"
            className="flex items-center gap-1 text-[var(--color-teal)] font-semibold hover:opacity-80 touch-target"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume</span>
          </button>
        ) : (
          <button
            onClick={pause}
            aria-label="Pause reading aloud"
            className="flex items-center gap-1 text-[var(--color-teal)] font-semibold hover:opacity-80 touch-target"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Pause</span>
          </button>
        )}
        <span className="text-[var(--color-border)]">|</span>
        <button
          onClick={cancel}
          aria-label="Stop reading aloud"
          className="p-1 text-[var(--color-ink-muted)] hover:text-red-500 touch-target"
        >
          <VolumeX className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => speak(text)}
      aria-label={`Read aloud: ${label}`}
      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-card-muted)] text-xs font-semibold text-[var(--color-ink)] transition-colors shadow-sm touch-target"
    >
      <Volume2 className="w-3.5 h-3.5 text-[var(--color-teal)]" aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
