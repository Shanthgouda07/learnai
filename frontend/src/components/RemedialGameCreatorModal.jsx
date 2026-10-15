import React, { useState } from 'react'
import {
  Gamepad2, Bug, Puzzle, Sparkles, Check, X,
  User, AlertTriangle, ArrowRight, Play, Terminal, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * RemedialGameCreatorModal Component
 * 
 * Allows teachers to focus on a lagging student (e.g. Casey S-004, S-011)
 * and generate a customized interactive game or remedial learning method tailored
 * to their specific prerequisite bottleneck.
 */
export default function RemedialGameCreatorModal({
  isOpen = false,
  onClose,
  student = { id: 'S-004', name: 'Casey Miller (Cadet S-004)', rootCause: 'Variables & Memory Reference (35%)', concept: 'Loops & Iterations' },
  onGameDeployed,
}) {
  const [gameType, setGameType] = useState('bughunt') // 'bughunt' | 'puzzle' | 'visualizer'
  const [gameTitle, setGameTitle] = useState(`Bug Hunt: Fix Variable Aliasing for ${student?.id || 'Student'}`)
  const [gameDescription, setGameDescription] = useState(
    `Find and correct the variable reference mutation bug causing loop counter miscalculations.`
  )
  const [challengeCode, setChallengeCode] = useState(
    `# Target Student Challenge: Resolve the Variable Mutation Trap
counter = 0
step_size = "1" # BUG: String instead of int causes concatenation crash!

# Correct the type bug below:
counter = counter + int(step_size)
print(f"Counter incremented to: {counter}")`
  )
  const [rewardXP, setRewardXP] = useState(75)

  if (!isOpen) return null

  const handleGameTypeChange = (type) => {
    setGameType(type)
    if (type === 'bughunt') {
      setGameTitle(`Bug Hunt: Prerequisite Rescue (${student?.id})`)
      setGameDescription(`Spot the syntax and state reassignment flaw before entering loop iterations.`)
      setChallengeCode(`score = 42\n# BUG: print("Score: " + score)\nprint("Score: " + str(score))`)
    } else if (type === 'puzzle') {
      setGameTitle(`Memory Code Puzzle: Step-by-Step State Flow`)
      setGameDescription(`Arrange the scrambled statements in correct logical sequence to update memory pointers.`)
      setChallengeCode(`Step 1: total = 0\nStep 2: for num in [1, 2, 3]:\nStep 3:     total += num\nStep 4: print(f"Total: {total}")`)
    } else {
      setGameTitle(`Socratic Step Trace Challenge`)
      setGameDescription(`Step through execution line by line and inspect local variables at each clock cycle.`)
      setChallengeCode(`def trace_loop():\n    val = 10\n    for i in range(3):\n        val += i\n    return val\nprint(trace_loop())`)
    }
  }

  const handleDeployGame = () => {
    const payload = {
      targetStudentId: student?.id,
      title: gameTitle,
      type: gameType,
      description: gameDescription,
      code: challengeCode,
      rewardXP: rewardXP,
      deployedAt: new Date().toLocaleTimeString(),
    }

    onGameDeployed?.(payload)
    toast.success(`🎉 Custom ${gameType} game deployed to ${student?.id}'s notebook!`, {
      duration: 4000,
      icon: '🎮',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#090D1A] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">
                Create Remedial Interactive Game for Lagging Student
              </h3>
              <p className="text-xs text-slate-400">
                Target: {student?.name || student?.id} · Root Cause: {student?.rootCause || 'Prerequisite Gap'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Student Prerequisite Bottleneck Card */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-rose-300">Lagging Focus: </span>
              Student <b>{student?.id}</b> is currently struggling with <b>{student?.concept || 'Loops'}</b> because of a foundational gap in <b>{student?.rootCause || 'Variables'}</b>. Creating an interactive challenge reinforces this prerequisite before advanced topics.
            </div>
          </div>

          {/* Game Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">Select Interactive Learning Method:</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleGameTypeChange('bughunt')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameType === 'bughunt'
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Bug className="w-4 h-4 text-cyan-400 mb-1" />
                <div className="text-xs font-bold text-white">Bug Hunt Game</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Spot & fix root error</div>
              </button>

              <button
                type="button"
                onClick={() => handleGameTypeChange('puzzle')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameType === 'puzzle'
                    ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Puzzle className="w-4 h-4 text-purple-400 mb-1" />
                <div className="text-xs font-bold text-white">Code Puzzle</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Scrambled execution flow</div>
              </button>

              <button
                type="button"
                onClick={() => handleGameTypeChange('visualizer')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameType === 'visualizer'
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-400 mb-1" />
                <div className="text-xs font-bold text-white">Step Visualizer</div>
                <div className="text-[10px] text-slate-400 mt-0.5">State & stack inspection</div>
              </button>
            </div>
          </div>

          {/* Game Title & Description */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Game Challenge Title:</label>
              <input
                type="text"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                className="w-full py-1.5 px-3 rounded-xl bg-[#05070E] border border-white/15 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-400">Student Instructions:</label>
              <input
                type="text"
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
                className="w-full py-1.5 px-3 rounded-xl bg-[#05070E] border border-white/15 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Code Challenge Workspace */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Challenge Code Sandbox:</span>
                <span className="text-cyan-400">+ {rewardXP} XP Completion Reward</span>
              </div>
              <div className="rounded-xl border border-white/15 bg-[#05070E] overflow-hidden focus-within:border-cyan-400 transition-colors">
                <textarea
                  value={challengeCode}
                  onChange={(e) => setChallengeCode(e.target.value)}
                  rows={6}
                  spellCheck="false"
                  className="w-full p-3 font-mono text-xs text-[#EEF1F8] bg-transparent resize-none outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDeployGame}
            className="py-2 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Deploy Game to {student?.id}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
