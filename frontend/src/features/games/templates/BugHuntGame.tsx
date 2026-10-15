import React, { useState } from 'react'
import { Bug, Check, AlertCircle, Wrench, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import HintLadder from '../HintLadder'
import { ItemFeedback } from '../useGameSession'

interface BugHuntGameProps {
  content: {
    prompt: string
    code: string
    fix_options: string[]
    hints?: string[]
  }
  onSubmitAnswer: (itemId: string | number, response: any) => Promise<ItemFeedback | null>
  onComplete: () => void
  hintsUsed: number
  onUseHint: () => void
}

export const BugHuntGame: React.FC<BugHuntGameProps> = ({
  content,
  onSubmitAnswer,
  onComplete,
  hintsUsed,
  onUseHint,
}) => {
  const reducedMotion = useReducedMotion()
  const codeLines = (content.code || '').split('\n')

  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [lineVerified, setLineVerified] = useState(false)
  const [lineNudge, setLineNudge] = useState<string | null>(null)
  const [selectedFix, setSelectedFix] = useState<number | null>(null)
  const [fixResult, setFixResult] = useState<ItemFeedback | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Step 1: Submit selected line
  const handleVerifyLine = async () => {
    if (selectedLine === null) return
    setSubmitting(true)
    setLineNudge(null)

    // Note: line numbers are 1-indexed for the student
    const result = await onSubmitAnswer('line', selectedLine + 1)
    setSubmitting(false)

    if (result) {
      if (result.correct) {
        setLineVerified(true)
      } else {
        setLineNudge(result.feedback || 'Look closely at variable assignments and loop boundaries.')
      }
    }
  }

  // Step 2: Submit chosen fix option
  const handleSelectFix = async (fixIndex: number) => {
    setSelectedFix(fixIndex)
    setSubmitting(true)

    const result = await onSubmitAnswer('fix', fixIndex)
    setSubmitting(false)
    if (result) {
      setFixResult(result)
      if (result.correct) {
        setTimeout(() => {
          onComplete()
        }, 1200)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Bug className="w-5 h-5 text-red-400" />
          <span>{content.prompt}</span>
        </h3>
        <p className="text-xs text-slate-400">
          {!lineVerified
            ? 'Step 1: Tap the line in the code below that contains the bug.'
            : 'Step 2: Great find! Now choose the correct fix below.'}
        </p>
      </div>

      {/* Interactive Code Lines Block */}
      <div className="rounded-2xl border border-surface-border bg-[#161622] overflow-hidden shadow-inner">
        <div className="p-2.5 px-4 bg-surface/50 border-b border-surface-border text-xs text-slate-500 font-mono flex items-center justify-between">
          <span>buggy_code.py</span>
          <span>{codeLines.length} lines</span>
        </div>

        <div className="py-2">
          {codeLines.map((line, idx) => {
            const isSelected = selectedLine === idx
            return (
              <button
                key={idx}
                type="button"
                disabled={lineVerified}
                onClick={() => {
                  setSelectedLine(idx)
                  setLineNudge(null)
                }}
                className={`w-full text-left px-4 py-2 font-mono text-sm flex items-center gap-4 transition-all ${
                  lineVerified && isSelected
                    ? 'bg-amber-500/20 text-amber-200 border-l-4 border-amber-400 font-semibold'
                    : isSelected
                    ? 'bg-red-500/15 text-red-200 border-l-4 border-red-400'
                    : 'text-slate-300 hover:bg-surface-hover/80 hover:text-white'
                }`}
              >
                <span className="text-slate-600 select-none text-xs w-6 text-right">
                  {idx + 1}
                </span>
                <span className="flex-1 whitespace-pre">{line || ' '}</span>
                {isSelected && !lineVerified && (
                  <span className="badge badge-red text-[10px]">Flagged</span>
                )}
                {isSelected && lineVerified && (
                  <span className="badge badge-amber text-[10px]">Bug Found</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 1 Verification Button & Nudge */}
      {!lineVerified && (
        <div className="space-y-3">
          {lineNudge && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-300"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{lineNudge}</span>
            </motion.div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleVerifyLine}
              disabled={selectedLine === null || submitting}
              className="btn-primary py-2.5 px-6 text-sm"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Bug className="w-4 h-4" />
                  <span>Verify Buggy Line</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Fix Options (Shown once buggy line is confirmed) */}
      <AnimatePresence>
        {lineVerified && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-4 border-t border-surface-border"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Wrench className="w-4 h-4 text-brand-400" />
              <span>Choose the correct replacement for Line {selectedLine! + 1}:</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(content.fix_options || []).map((fix, fIdx) => {
                const isPicked = selectedFix === fIdx
                const isSuccess = isPicked && fixResult?.correct
                const isFail = isPicked && fixResult && !fixResult.correct

                return (
                  <button
                    key={fIdx}
                    type="button"
                    disabled={submitting || (fixResult && fixResult.correct)}
                    onClick={() => handleSelectFix(fIdx)}
                    className={`w-full text-left p-4 rounded-xl border font-mono text-sm transition-all flex items-center justify-between ${
                      isSuccess
                        ? 'bg-teal-500/20 border-teal-500/60 text-teal-200 ring-2 ring-teal-500/30'
                        : isFail
                        ? 'bg-red-500/20 border-red-500/60 text-red-200'
                        : isPicked
                        ? 'bg-brand-600/30 border-brand-500/60 text-brand-200'
                        : 'bg-surface-card border-surface-border text-slate-200 hover:border-slate-500 hover:bg-surface-hover'
                    }`}
                  >
                    <span>{fix}</span>
                    {isSuccess && <Check className="w-5 h-5 text-teal-400" />}
                    {isFail && <AlertCircle className="w-5 h-5 text-red-400" />}
                  </button>
                )
              })}
            </div>

            {fixResult && fixResult.correct && fixResult.explanation && (
              <div className="p-3 bg-teal-950/30 border border-teal-500/30 rounded-xl text-xs text-teal-300">
                💡 {fixResult.explanation}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Ladder */}
      {content.hints && content.hints.length > 0 && (
        <HintLadder
          hints={content.hints}
          revealedCount={hintsUsed}
          onReveal={onUseHint}
        />
      )}
    </div>
  )
}
export default BugHuntGame
