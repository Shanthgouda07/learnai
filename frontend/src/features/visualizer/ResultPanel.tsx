import React from 'react'
import { CheckCircle2, XCircle, Award, HelpCircle } from 'lucide-react'

export interface TestCaseResult {
  name: string
  passed: boolean
  expected: string
  actual: string
  error?: string | null
}

interface ResultPanelProps {
  passed: boolean
  results: TestCaseResult[]
  pointsAwarded: number
  accuracy: number
  onJumpToDivergence?: (divergenceIndex: number) => void
  steps?: Array<{ stdout: string }>
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  passed,
  results = [],
  pointsAwarded,
  accuracy,
  onJumpToDivergence,
  steps = [],
}) => {
  // Find step index where output diverged for the first failed test case
  const findDivergenceStep = (expected: string): number => {
    if (!steps || steps.length === 0) return 0
    for (let i = 0; i < steps.length; i++) {
      const stepStdout = (steps[i].stdout || '').trim()
      // If output started deviating from the prefix of expected output
      if (stepStdout && !expected.trim().startsWith(stepStdout)) {
        return i
      }
    }
    return Math.max(0, steps.length - 1)
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Overall Status Banner */}
      <div
        className={`p-4 rounded-xl flex items-center justify-between gap-4 ${
          passed
            ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/40 border border-red-500/40 text-red-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {passed ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-base text-white">
              {passed ? '🎉 All Test Cases Passed!' : 'Some Test Cases Failed'}
            </h4>
            <p className="text-xs opacity-80 mt-0.5">
              Accuracy: {Math.round(accuracy * 100)}% • Points: {pointsAwarded}
            </p>
          </div>
        </div>

        {passed && (
          <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <Award className="w-5 h-5 text-emerald-300" />
            <span className="font-bold text-sm text-emerald-200">+{pointsAwarded} pts</span>
          </div>
        )}
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Test Results ({results.filter(r => r.passed).length}/{results.length})
        </h5>
        {results.map((tc, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border space-y-2 ${
              tc.passed
                ? 'bg-surface/50 border-emerald-500/20'
                : 'bg-surface/80 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {tc.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="font-semibold text-sm text-slate-200">{tc.name}</span>
              </div>

              {!tc.passed && onJumpToDivergence && (
                <button
                  onClick={() => onJumpToDivergence(findDivergenceStep(tc.expected))}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-600/10 hover:bg-brand-600/20 px-2.5 py-1 rounded-lg border border-brand-500/30 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why did this fail?</span>
                </button>
              )}
            </div>

            {!tc.passed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded bg-surface border border-surface-border">
                  <span className="text-slate-500 block mb-0.5 text-[10px] uppercase">Expected:</span>
                  <pre className="text-emerald-300 whitespace-pre-wrap">{tc.expected || '(empty)'}</pre>
                </div>
                <div className="p-2 rounded bg-surface border border-surface-border">
                  <span className="text-slate-500 block mb-0.5 text-[10px] uppercase">Actual:</span>
                  <pre className="text-red-300 whitespace-pre-wrap">{tc.actual || '(empty)'}</pre>
                </div>
                {tc.error && (
                  <div className="col-span-full p-2 rounded bg-red-950/30 border border-red-500/30 text-red-300">
                    <span className="text-red-400 font-semibold">Error: </span>
                    {tc.error}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
export default ResultPanel
