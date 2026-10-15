import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Link2, Repeat } from 'lucide-react'

interface VariablesPanelProps {
  locals: Record<string, any>
  globals: Record<string, any>
  changed: string[]
  currentLine?: number
  stepNumber?: number
}

// Render formatted representation of complex objects (lists, dicts, primitives)
const RenderValue: React.FC<{ value: any; isChanged?: boolean; reducedMotion?: boolean | null }> = ({
  value,
  isChanged,
  reducedMotion,
}) => {
  if (value === null) return <span className="text-slate-400 italic">None</span>
  if (typeof value === 'boolean') return <span className="text-purple-400 font-semibold">{value ? 'True' : 'False'}</span>
  if (typeof value === 'number') return <span className="text-emerald-400 font-semibold">{value}</span>
  if (typeof value === 'string') return <span className="text-amber-300 font-mono">"{value}"</span>

  if (typeof value === 'object') {
    if (value.type === 'list' || value.type === 'tuple' || value.type === 'set') {
      const items = value.items || []
      const brackets = value.type === 'list' ? ['[', ']'] : (value.type === 'tuple' ? ['(', ')'] : ['{', '}'])
      return (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-slate-500 font-mono text-sm">{brackets[0]}</span>
          {items.map((item: any, idx: number) => (
            <div
              key={idx}
              className={`flex flex-col items-center border rounded px-1.5 py-0.5 text-xs font-mono transition-colors ${
                isChanged ? 'bg-amber-500/10 border-amber-500/30' : 'bg-surface border-surface-border text-slate-200'
              }`}
            >
              <span className="text-[10px] text-slate-500 select-none">{idx}</span>
              <RenderValue value={item} reducedMotion={reducedMotion} />
            </div>
          ))}
          {value.length > items.length && (
            <span className="text-xs text-slate-500">+{value.length - items.length} more</span>
          )}
          <span className="text-slate-500 font-mono text-sm">{brackets[1]}</span>
        </div>
      )
    }

    if (value.type === 'dict') {
      const entries = value.entries || []
      return (
        <div className="flex flex-col gap-1 pt-1">
          <span className="text-slate-500 font-mono text-sm">&#123;</span>
          <div className="pl-2 space-y-1">
            {entries.map((entry: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-mono">
                <RenderValue value={entry.key} reducedMotion={reducedMotion} />
                <span className="text-slate-500">:</span>
                <RenderValue value={entry.value} reducedMotion={reducedMotion} />
              </div>
            ))}
          </div>
          <span className="text-slate-500 font-mono text-sm">&#125;</span>
        </div>
      )
    }

    if (value.type === 'function') {
      return <span className="text-cyan-400 font-mono text-xs">&lt;func {value.name}&gt;</span>
    }

    if (value.repr) {
      return <span className="text-slate-300 font-mono text-xs">{value.repr}</span>
    }
  }

  return <span className="text-slate-300 font-mono text-xs">{String(value)}</span>
}

export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  locals = {},
  globals = {},
  changed = [],
  currentLine,
  stepNumber,
}) => {
  const reducedMotion = useReducedMotion()
  const [prevValues, setPrevValues] = useState<Record<string, any>>({})
  const [fadingOld, setFadingOld] = useState<Record<string, any>>({})
  const prevLineRef = useRef<number | null>(null)
  const lineRepeatCountRef = useRef<number>(1)

  // Track loop line repetitions
  useEffect(() => {
    if (currentLine !== undefined && currentLine === prevLineRef.current) {
      lineRepeatCountRef.current += 1
    } else {
      lineRepeatCountRef.current = 1
      prevLineRef.current = currentLine || null
    }
  }, [currentLine, stepNumber])

  // Merge active scope: locals take precedence over globals
  const allVars = { ...globals, ...locals }

  // Track changes and display struck-through old values for ~600ms
  useEffect(() => {
    if (reducedMotion) return

    const newlyChanged: Record<string, any> = {}
    changed.forEach(name => {
      if (prevValues[name] !== undefined) {
        newlyChanged[name] = prevValues[name]
      }
    })

    if (Object.keys(newlyChanged).length > 0) {
      setFadingOld(newlyChanged)
      const t = setTimeout(() => {
        setFadingOld({})
      }, 650)
      return () => clearTimeout(t)
    }
    setPrevValues(allVars)
  }, [allVars, changed, reducedMotion])

  // Detect shared object references (same object id across variables)
  const idCounts = new Map<number, number>()
  Object.values(allVars).forEach(v => {
    if (v && typeof v === 'object' && v.id) {
      idCounts.set(v.id, (idCounts.get(v.id) || 0) + 1)
    }
  })

  const varEntries = Object.entries(allVars)

  return (
    <div className="flex flex-col h-full bg-surface-card rounded-2xl border border-surface-border p-4 overflow-hidden">
      {/* Header with loop repetition badge */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <span>Variables</span>
          <span className="text-xs font-mono text-slate-500">({varEntries.length})</span>
        </h3>
        {lineRepeatCountRef.current > 1 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-brand-600/20 text-brand-300 border border-brand-600/30">
            <Repeat className="w-3 h-3 animate-spin-slow" />
            <span>iteration {lineRepeatCountRef.current}</span>
          </div>
        )}
      </div>

      {/* Variables list */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
        {varEntries.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
            No variables in current scope
          </div>
        ) : (
          <AnimatePresence>
            {varEntries.map(([name, val]) => {
              const isChanged = changed.includes(name)
              const oldVal = fadingOld[name]
              const objId = val && typeof val === 'object' ? val.id : null
              const isShared = objId && (idCounts.get(objId) || 0) > 1

              return (
                <motion.div
                  key={name}
                  layout={!reducedMotion}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 rounded-xl border transition-all ${
                    isChanged && !reducedMotion
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'bg-surface/70 border-surface-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm font-semibold text-slate-200">{name}</span>
                      {name in locals && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">local</span>
                      )}
                    </div>

                    {isShared && (
                      <div className="flex items-center gap-1 text-[10px] text-teal-300 bg-teal-500/10 border border-teal-500/30 px-1.5 py-0.5 rounded">
                        <Link2 className="w-3 h-3" />
                        <span>same object #{objId % 1000}</span>
                      </div>
                    )}
                  </div>

                  {/* Old struck-through value during transition */}
                  {oldVal !== undefined && !reducedMotion && (
                    <motion.div
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-xs line-through text-slate-500 font-mono mb-1"
                    >
                      <RenderValue value={oldVal} reducedMotion={reducedMotion} />
                    </motion.div>
                  )}

                  {/* Current value */}
                  <div className="text-sm">
                    <RenderValue value={val} isChanged={isChanged} reducedMotion={reducedMotion} />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
export default VariablesPanel
