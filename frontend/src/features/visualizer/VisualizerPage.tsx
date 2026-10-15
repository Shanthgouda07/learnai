import React, { useState } from 'react'
import {
  Play,
  RotateCcw,
  Code2,
  Sparkles,
  Info,
  ChevronDown,
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import CodeEditor from './CodeEditor'
import VariablesPanel from './VariablesPanel'
import CallStackPanel from './CallStackPanel'
import OutputPanel from './OutputPanel'
import Timeline from './Timeline'
import { usePlayback, TraceStep } from './usePlayback'

const CODE_EXAMPLES = [
  {
    name: '1. Loop: Sum 1 to 5',
    code: `# Loop summation demonstration
total = 0
for i in range(1, 6):
    total += i
    print(f"Step {i}: total is {total}")

print(f"Final total: {total}")`,
  },
  {
    name: '2. Recursion: Factorial(4)',
    code: `# Watch the call stack grow and unwind!
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

result = factorial(4)
print(f"4! = {result}")`,
  },
  {
    name: '3. Variables: Swap Values',
    code: `# Variable assignment and tuple swap
a = 10
b = 20
print(f"Before: a={a}, b={b}")

# Simultaneous swap
a, b = b, a
print(f"After: a={a}, b={b}")`,
  },
  {
    name: '4. Lists: Mutation & Shared References',
    code: `# Shared references and mutations
original = [1, 2, 3]
alias = original  # Same object reference

alias.append(99)
print("Original:", original)
print("Alias:", alias)`,
  },
  {
    name: '5. Error: Division by Zero',
    code: `# Stepping up to an exception
numerator = 100
denominator = 0

print("About to divide...")
result = numerator / denominator
print("Done")`,
  },
  {
    name: '6. Safety: Infinite Loop Protection',
    code: `# Sandbox stops infinite loops automatically
count = 0
while True:
    count += 1`,
  },
]

export const VisualizerPage: React.FC = () => {
  const [code, setCode] = useState(CODE_EXAMPLES[0].code)
  const [selectedExample, setSelectedExample] = useState(0)
  const [tracing, setTracing] = useState(false)
  const [steps, setSteps] = useState<TraceStep[]>([])
  const [runtimeError, setRuntimeError] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'variables' | 'stack' | 'output'>('variables')

  const playback = usePlayback(steps)
  const currentStep = playback.currentStep

  const handleRunVisualize = async () => {
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
      } else {
        toast.success(`Trace captured: ${data.steps?.length || 0} steps`)
      }
      setSteps(data.steps || [])
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Visualization request failed')
    } finally {
      setTracing(false)
    }
  }

  const handleSelectExample = (idx: number) => {
    setSelectedExample(idx)
    setCode(CODE_EXAMPLES[idx].code)
    setSteps([])
    setRuntimeError(null)
  }

  const handleReset = () => {
    setCode(CODE_EXAMPLES[selectedExample].code)
    setSteps([])
    setRuntimeError(null)
  }

  return (
    <div className="min-h-screen bg-surface p-4 md:p-6 flex flex-col space-y-4 max-w-7xl mx-auto">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-900/40">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Python Code Visualizer
              <span className="badge badge-brand text-[10px]">Sandbox v1.0</span>
            </h1>
            <p className="text-xs text-slate-400">
              Step-by-step program execution, animated variables & call stack
            </p>
          </div>
        </div>

        {/* Toolbar: Examples & Run */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Examples Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              id="example-select"
              value={selectedExample}
              onChange={e => handleSelectExample(parseInt(e.target.value, 10))}
              className="bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-brand-500 cursor-pointer appearance-none pr-8 w-full"
            >
              {CODE_EXAMPLES.map((ex, i) => (
                <option key={i} value={i}>
                  {ex.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            title="Reset code to example starter"
            onClick={handleReset}
            className="btn-ghost py-2 px-3 text-xs border border-surface-border"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            id="run-visualize-btn"
            onClick={handleRunVisualize}
            disabled={tracing}
            className="btn-primary py-2 px-4 text-xs whitespace-nowrap"
          >
            {tracing ? (
              <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>Run & Visualize</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[520px]">
        {/* Left: Code Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-surface-card rounded-2xl border border-surface-border overflow-hidden">
          <div className="p-2.5 px-4 bg-surface/70 border-b border-surface-border flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>main.py</span>
            <span>{code.split('\n').length} lines</span>
          </div>

          <div className="flex-1 min-h-[360px]">
            <CodeEditor
              code={code}
              onChange={setCode}
              currentLine={currentStep?.line}
              isError={!!runtimeError || currentStep?.event === 'exception'}
              errorLine={runtimeError?.line}
            />
          </div>
        </div>

        {/* Right: State Inspection Panels (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-2">
          {/* Tabs */}
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

          <div className="flex-1 min-h-[360px]">
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
    </div>
  )
}
export default VisualizerPage
