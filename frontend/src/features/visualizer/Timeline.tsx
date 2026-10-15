import React from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
} from 'lucide-react'

interface TimelineProps {
  index: number
  totalSteps: number
  playing: boolean
  speed: number
  event?: string
  currentLine?: number
  onTogglePlay: () => void
  onNext: () => void
  onPrev: () => void
  onSeek: (idx: number) => void
  onRestart: () => void
  onSetSpeed: (speed: number) => void
}

const SPEED_OPTIONS = [0.5, 1, 2, 4]

export const Timeline: React.FC<TimelineProps> = ({
  index,
  totalSteps,
  playing,
  speed,
  event = 'line',
  currentLine,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onRestart,
  onSetSpeed,
}) => {
  const isStart = index === 0
  const isEnd = index >= totalSteps - 1 || totalSteps === 0

  const getEventBadge = () => {
    switch (event) {
      case 'call':
        return <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30">call</span>
      case 'return':
        return <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">return</span>
      case 'exception':
        return <span className="badge bg-red-500/20 text-red-300 border border-red-500/30">exception</span>
      default:
        return <span className="badge bg-slate-700 text-slate-300">line</span>
    }
  }

  return (
    <div className="w-full bg-surface-card border border-surface-border rounded-2xl p-3 px-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
      {/* Left side: Step info and event chip */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <span className="font-mono text-sm font-semibold text-white">
          Step {totalSteps > 0 ? index + 1 : 0} <span className="text-slate-500">/ {totalSteps}</span>
        </span>
        {totalSteps > 0 && getEventBadge()}
        {currentLine && (
          <span className="text-xs font-mono text-slate-400">Line {currentLine}</span>
        )}
      </div>

      {/* Middle: Controls & Scrub Slider */}
      <div className="flex-1 flex items-center gap-3 max-w-2xl w-full">
        {/* Playback action buttons */}
        <div className="flex items-center gap-1">
          <button
            title="Restart (Home)"
            onClick={onRestart}
            disabled={totalSteps <= 1 || isStart}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            title="Step back (Left Arrow)"
            onClick={onPrev}
            disabled={totalSteps <= 1 || isStart}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            title={playing ? 'Pause (Space)' : 'Play (Space)'}
            onClick={onTogglePlay}
            disabled={totalSteps <= 1}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-30 shadow-md shadow-brand-900/30 transition-all active:scale-95"
          >
            {playing ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          </button>
          <button
            title="Step forward (Right Arrow)"
            onClick={onNext}
            disabled={totalSteps <= 1 || isEnd}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Scrub slider */}
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={index}
          onChange={e => onSeek(parseInt(e.target.value, 10))}
          disabled={totalSteps <= 1}
          className="flex-1 accent-brand-500 cursor-pointer disabled:opacity-40"
        />
      </div>

      {/* Right side: Speed selector */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-500 mr-1 hidden sm:inline">Speed:</span>
        {SPEED_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => onSetSpeed(s)}
            className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              speed === s
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-surface-hover'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}
export default Timeline
