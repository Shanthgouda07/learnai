import React from 'react'
import { Lightbulb, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

interface HintLadderProps {
  hints: string[]
  revealedCount: number
  onReveal: () => void
  disabled?: boolean
}

export const HintLadder: React.FC<HintLadderProps> = ({
  hints = [],
  revealedCount,
  onReveal,
  disabled = false,
}) => {
  const reducedMotion = useReducedMotion()
  const canRevealMore = revealedCount < hints.length

  if (hints.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onReveal}
          disabled={!canRevealMore || disabled}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {canRevealMore
              ? `Get Hint (${revealedCount}/${hints.length}) • -5 pts`
              : `All hints revealed (${hints.length}/${hints.length})`}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {revealedCount > 0 && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? false : { opacity: 0, height: 0 }}
            className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2 text-xs"
          >
            {hints.slice(0, revealedCount).map((hint, idx) => (
              <div key={idx} className="flex items-start gap-2 text-amber-200">
                <span className="font-bold text-amber-400 select-none">Hint {idx + 1}:</span>
                <span className="leading-relaxed">{hint}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default HintLadder
