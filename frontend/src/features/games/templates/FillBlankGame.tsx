import React, { useState } from 'react'
import { Check, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import HintLadder from '../HintLadder'
import { ItemFeedback } from '../useGameSession'

interface FillBlankGameProps {
  content: {
    prompt: string
    code_template: string
    blanks: Array<{ id: string | number; options: string[] }>
    hints?: string[]
  }
  onSubmitAnswer: (id: string | number, response: string) => Promise<ItemFeedback | null>
  onComplete: () => void
  hintsUsed: number
  onUseHint: () => void
}

export const FillBlankGame: React.FC<FillBlankGameProps> = ({
  content,
  onSubmitAnswer,
  onComplete,
  hintsUsed,
  onUseHint,
}) => {
  const reducedMotion = useReducedMotion()
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [feedbackMap, setFeedbackMap] = useState<Record<string, ItemFeedback>>({})
  const [submitting, setSubmitting] = useState(false)

  const blanks = content.blanks || []
  const allAnswered = blanks.length > 0 && blanks.every(b => !!selectedAnswers[String(b.id)])
  const allCorrect = blanks.length > 0 && blanks.every(b => feedbackMap[String(b.id)]?.correct)

  const handleSelectOption = (blankId: string | number, value: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [String(blankId)]: value,
    }))
    // Reset feedback on change
    setFeedbackMap(prev => {
      const copy = { ...prev }
      delete copy[String(blankId)]
      return copy
    })
  }

  const handleCheckAnswers = async () => {
    setSubmitting(true)
    let everyBlankCorrect = true

    for (const b of blanks) {
      const val = selectedAnswers[String(b.id)]
      if (val) {
        const res = await onSubmitAnswer(b.id, val)
        if (res) {
          setFeedbackMap(prev => ({ ...prev, [String(b.id)]: res }))
          if (!res.correct) everyBlankCorrect = false
        }
      } else {
        everyBlankCorrect = false
      }
    }
    setSubmitting(false)

    if (everyBlankCorrect) {
      setTimeout(() => {
        onComplete()
      }, 700)
    }
  }

  // Render code template replacing ___id___ placeholders with interactive select chips
  const renderCodeWithChips = () => {
    const template = content.code_template || ''
    // Regex matches patterns like ___0___, ___name___, ___1___
    const parts = template.split(/(___[a-zA-Z0-9_-]+___)/g)

    return parts.map((part, index) => {
      const match = part.match(/^___([a-zA-Z0-9_-]+)___$/)
      if (match) {
        const rawId = match[1]
        // Match against blank
        const blank = blanks.find(b => String(b.id) === rawId) || blanks[index]
        if (!blank) return <span key={index}>{part}</span>

        const currentVal = selectedAnswers[String(blank.id)] || ''
        const fb = feedbackMap[String(blank.id)]
        const isCorrect = fb?.correct
        const isWrong = fb && !fb.correct

        return (
          <span key={index} className="inline-block mx-1.5 align-middle">
            <select
              value={currentVal}
              onChange={e => handleSelectOption(blank.id, e.target.value)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold border transition-all cursor-pointer outline-none ${
                isCorrect
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 ring-2 ring-teal-500/20'
                  : isWrong
                  ? 'bg-red-500/20 border-red-500/50 text-red-300 ring-2 ring-red-500/20 animate-shake'
                  : currentVal
                  ? 'bg-brand-600/30 border-brand-500/60 text-brand-200'
                  : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
              }`}
            >
              <option value="" disabled>
                Select...
              </option>
              {(blank.options || []).map((opt, oi) => (
                <option key={oi} value={opt} className="bg-surface-card text-white">
                  {opt}
                </option>
              ))}
            </select>
          </span>
        )
      }

      return (
        <span key={index} className="whitespace-pre">
          {part}
        </span>
      )
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-base font-bold text-white">{content.prompt}</h3>
        <p className="text-xs text-slate-400">
          Pick the right token for each blank in the code below.
        </p>
      </div>

      {/* Styled Code Block */}
      <div className="p-6 bg-[#161622] rounded-2xl border border-surface-border font-mono text-sm leading-loose overflow-x-auto shadow-inner text-slate-200">
        <pre className="font-mono">{renderCodeWithChips()}</pre>
      </div>

      {/* Hint Ladder */}
      {content.hints && content.hints.length > 0 && (
        <HintLadder
          hints={content.hints}
          revealedCount={hintsUsed}
          onReveal={onUseHint}
        />
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        <div className="text-xs text-slate-500">
          {Object.values(feedbackMap).some(f => !f.correct) && (
            <span className="text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Some blanks are incorrect. Try again!
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={allCorrect ? onComplete : handleCheckAnswers}
          disabled={!allAnswered || submitting}
          className="btn-primary py-2.5 px-6 text-sm"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          ) : allCorrect ? (
            <>
              <span>Finish & View Score</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Check Answers</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
export default FillBlankGame
