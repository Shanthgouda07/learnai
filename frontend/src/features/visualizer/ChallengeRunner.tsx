import React, { useState, useEffect } from 'react'
import {
  Play,
  CheckCircle,
  Lightbulb,
  HelpCircle,
  Target,
  Sparkles,
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import CodeEditor from './CodeEditor'
import VariablesPanel from './VariablesPanel'
import CallStackPanel from './CallStackPanel'
import OutputPanel from './OutputPanel'
import Timeline from './Timeline'
import ResultPanel, { TestCaseResult } from './ResultPanel'
import { usePlayback, TraceStep } from './usePlayback'

interface ChallengeProps {
  game: {
    id: number
    title: string
    max_points: number
    content_json: string
  }
  onComplete?: (score: number, accuracy: number) => Promise<void>
}

export const ChallengeRunner: React.FC<ChallengeProps> = ({ game, onComplete }) => {
  const content = React.useMemo(() => {
    try {
      return JSON.parse(game.content_json)
    } catch {
      return {}
    }
  }, [game.content_json])

  const kind = content.kind || 'fix_bug'
  const prompt = content.prompt || ''
  const starterCode = content.starter_code || ''
  const expectedOutput = content.expected_output || ''
  const hints: string[] = content.hints || []

  const [code, setCode] = useState(starterCode)
  const [predictedOutput, setPredictedOutput] = useState('')
  const [predictionSubmitted, setPredictionSubmitted] = useState(false)
  const [revealedHints, setRevealedHints] = useState<number>(0)
  const [tracing, setTracing] = useState(false)
  const [steps, setSteps] = useState<TraceStep[]>([])
  const [runtimeError, setRuntimeError] = useState<any>(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{
    passed: boolean
    results: TestCaseResult[]
    pointsAwarded: number
    accuracy: number
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'variables' | 'stack' | 'output'>('variables')
  const [startTime] = useState(Date.now())

  const playback = usePlayback(steps)
  const currentStep = playback.currentStep

  // Run & Visualize code
  const handleVisualize = async () => {
    setTracing(true)
    setRuntimeError(null)
    try {
      const { data } = await api.post('/visualizer/trace', {
        code,
        stdin_lines: [],
        max_steps: 500,
      })
      if (data.error) {
        setRuntimeError(data.error)
        toast.error(`${data.error.type}: ${data.error.message}`)
      }
      setSteps(data.steps || [])
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Visualization failed')
    } finally {
      setTracing(false)
    }
  }

  // Check my answer
  const handleCheck = async () => {
    setChecking(true)
    try {
      const durationSec = Math.round((Date.now() - startTime) / 1000)
      const { data } = await api.post('/visualizer/check', {
        challenge_id: game.id,
        code,
        duration: durationSec,
      })

      // If predict_output challenge, verify student's prediction matches
      let finalPoints = data.points_awarded
      if (kind === 'predict_output') {
        const predCorrect = predictedOutput.trim() === expectedOutput.trim()
        if (!predCorrect) {
          finalPoints = Math.round(finalPoints * 0.5)
        }
      }

      // Deduct points for hints used (5 pts per hint)
      finalPoints = Math.max(0, finalPoints - revealedHints * 5)

      setCheckResult({
        ...data,
        pointsAwarded: finalPoints,
      })

      if (data.passed) {
        toast.success(`Awesome! Challenge completed (+${finalPoints} pts)`)
        if (onComplete) {
          await onComplete(finalPoints, data.accuracy)
        }
      } else {
        toast.error('Some test cases failed. Check results below!')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Grading request failed')
    } finally {
      setChecking(false)
    }
  }

  const handleRevealHint = () => {
    if (revealedHints < hints.length) {
      setRevealedHints(prev => prev + 1)
      toast(`Hint revealed (-5 pts)`, { icon: '💡' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Challenge Header Card */}
      <div className="card p-5 border-brand-500/30 bg-surface-card space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-brand capitalize">{kind.replace('_', ' ')}</span>
              <span className="badge bg-slate-800 text-slate-400 font-mono text-xs">{content.topic || 'Python'}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{game.title}</h2>
          </div>

          {/* Hint Ladder */}
          {hints.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRevealHint}
                disabled={revealedHints >= hints.length}
                className="btn-ghost text-xs py-1.5 px-3 border border-surface-border text-amber-300 hover:text-amber-200"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Need a hint? ({revealedHints}/{hints.length})</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">{prompt}</p>

        {/* Revealed Hints */}
        {revealedHints > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-xs">
            {hints.slice(0, revealedHints).map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-amber-200">
                <span className="font-semibold text-amber-400">Hint {i + 1}:</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Challenge-specific UI: Target output for make_it_print */}
        {kind === 'make_it_print' && expectedOutput && (
          <div className="p-3 bg-surface border border-surface-border rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Target className="w-4 h-4 text-brand-400" /> Target Output:
            </span>
            <code className="bg-black/60 px-2.5 py-1 rounded text-emerald-300 font-mono">
              {expectedOutput}
            </code>
          </div>
        )}

        {/* Predict Output prompt input */}
        {kind === 'predict_output' && (
          <div className="p-3.5 bg-brand-950/30 border border-brand-500/30 rounded-xl space-y-2">
            <label className="text-xs font-semibold text-brand-300 block">
              Step 1: Predict what this code will output before running:
            </label>
            <div className="flex gap-2">
              <input
                id="predicted-output-input"
                className="input text-xs py-2"
                placeholder="Type your prediction here..."
                value={predictedOutput}
                onChange={e => setPredictedOutput(e.target.value)}
              />
              <button
                className="btn-primary text-xs whitespace-nowrap"
                onClick={() => {
                  if (!predictedOutput.trim()) {
                    toast.error('Enter a prediction first!')
                    return
                  }
                  setPredictionSubmitted(true)
                  handleVisualize()
                }}
              >
                Lock Prediction & Visualize
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor & Panels Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[560px]">
        {/* Left: Monaco Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-surface-card rounded-2xl border border-surface-border overflow-hidden">
          {/* Editor Toolbar */}
          <div className="p-2.5 px-4 bg-surface/80 border-b border-surface-border flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-400">solution.py</span>

            <div className="flex items-center gap-2">
              <button
                id="visualize-btn"
                className="btn-ghost py-1.5 px-3 text-xs text-brand-300 border border-brand-500/30 hover:bg-brand-600/20"
                onClick={handleVisualize}
                disabled={tracing}
              >
                {tracing ? (
                  <span className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-brand-400 text-brand-400" />
                )}
                <span>Run & Visualize</span>
              </button>

              <button
                id="check-answer-btn"
                className="btn-primary py-1.5 px-3.5 text-xs"
                onClick={handleCheck}
                disabled={checking}
              >
                {checking ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                <span>Check my answer</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              code={code}
              onChange={setCode}
              currentLine={currentStep?.line}
              isError={!!runtimeError || currentStep?.event === 'exception'}
              errorLine={runtimeError?.line}
            />
          </div>
        </div>

        {/* Right: Tabbed Panels on small screens, stacked on large (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-2">
          {/* Tabs for switching panels */}
          <div className="flex items-center gap-1 bg-surface-card p-1 rounded-xl border border-surface-border">
            {(['variables', 'stack', 'output'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'stack' ? 'Call Stack' : tab}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'variables' && (
              <VariablesPanel
                locals={currentStep?.locals || {}}
                globals={currentStep?.globals || {}}
                changed={currentStep?.changed || []}
                currentLine={currentStep?.line}
                stepNumber={playback.index}
              />
            )}
            {activeTab === 'stack' && (
              <CallStackPanel
                callStack={currentStep?.call_stack || []}
                event={currentStep?.event}
                returnValue={currentStep?.return_value}
              />
            )}
            {activeTab === 'output' && (
              <OutputPanel
                stdout={currentStep?.stdout || ''}
                error={runtimeError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Timeline */}
      <Timeline
        index={playback.index}
        totalSteps={playback.totalSteps}
        playing={playback.playing}
        speed={playback.speed}
        event={currentStep?.event}
        currentLine={currentStep?.line}
        onTogglePlay={playback.togglePlay}
        onNext={playback.next}
        onPrev={playback.prev}
        onSeek={playback.seek}
        onRestart={playback.restart}
        onSetSpeed={playback.setSpeed}
      />

      {/* Test Case Results Panel */}
      {checkResult && (
        <ResultPanel
          passed={checkResult.passed}
          results={checkResult.results}
          pointsAwarded={checkResult.pointsAwarded}
          accuracy={checkResult.accuracy}
          steps={steps}
          onJumpToDivergence={divIdx => playback.seek(divIdx)}
        />
      )}
    </div>
  )
}
export default ChallengeRunner
