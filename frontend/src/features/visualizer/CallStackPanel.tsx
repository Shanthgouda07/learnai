import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Layers, ArrowRight } from 'lucide-react'

interface CallStackFrame {
  func: string
  line: number
  locals: Record<string, any>
}

interface CallStackPanelProps {
  callStack?: CallStackFrame[]
  event?: string
  returnValue?: any | null
}

export const CallStackPanel: React.FC<CallStackPanelProps> = ({
  callStack = [],
  event,
  returnValue,
}) => {
  const reducedMotion = useReducedMotion()

  return (
    <div className="flex flex-col h-full bg-surface-card rounded-2xl border border-surface-border p-4 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-400" />
          <span>Call Stack</span>
          <span className="text-xs font-mono text-slate-500">({callStack.length})</span>
        </h3>
        {event === 'return' && returnValue !== null && returnValue !== undefined && (
          <div className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono animate-fade-in">
            <ArrowRight className="w-3 h-3" />
            <span>returned {typeof returnValue === 'object' ? JSON.stringify(returnValue) : String(returnValue)}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
        {callStack.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
            Stack is empty
          </div>
        ) : (
          <AnimatePresence>
            {callStack.map((frame, index) => {
              const isTop = index === 0
              const localsCount = Object.keys(frame.locals || {}).length

              return (
                <motion.div
                  key={`${frame.func}-${callStack.length - index}`}
                  layout={!reducedMotion}
                  initial={
                    reducedMotion
                      ? false
                      : { scale: 0.9, opacity: 0, y: -8 }
                  }
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={
                    reducedMotion
                      ? false
                      : { scale: 0.9, opacity: 0, transition: { duration: 0.15 } }
                  }
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`p-3 rounded-xl border transition-all ${
                    isTop
                      ? 'bg-brand-950/40 border-brand-500/50 shadow-sm shadow-brand-500/10'
                      : 'bg-surface/60 border-surface-border'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-sm font-semibold ${
                          isTop ? 'text-brand-300' : 'text-slate-300'
                        }`}
                      >
                        {frame.func}()
                      </span>
                      {isTop && (
                        <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/40 px-1.5 py-0.2 rounded font-semibold">
                          active
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500">line {frame.line}</span>
                  </div>

                  {localsCount > 0 && (
                    <div className="mt-2 pt-2 border-t border-surface-border/60 text-xs font-mono text-slate-400 space-y-0.5">
                      {Object.entries(frame.locals).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-slate-500">{k}:</span>
                          <span className="text-slate-300 truncate max-w-[140px]">
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
export default CallStackPanel
