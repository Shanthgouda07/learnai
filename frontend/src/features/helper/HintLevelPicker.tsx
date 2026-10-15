import React from 'react'
import { Sparkles, HelpCircle, Compass } from 'lucide-react'

interface HintLevelPickerProps {
  currentLevel: number
  onChange: (level: number) => void
  isGameSession?: boolean
}

const LEVELS = [
  {
    level: 1,
    title: 'Nudge',
    desc: 'Guiding question',
    cost: 'Free',
    icon: HelpCircle,
  },
  {
    level: 2,
    title: 'Bigger hint',
    desc: 'Points to concept',
    cost: '-5 pts',
    icon: Compass,
  },
  {
    level: 3,
    title: 'Example',
    desc: 'Worked similar problem',
    cost: '-5 pts',
    icon: Sparkles,
  },
]

export const HintLevelPicker: React.FC<HintLevelPickerProps> = ({
  currentLevel,
  onChange,
  isGameSession = false,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span className="font-medium">Hint Depth:</span>
        {isGameSession && (
          <span className="text-amber-400 font-semibold text-[10px]">
            Bigger hints cost 5 pts in games
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {LEVELS.map(item => {
          const isSelected = currentLevel === item.level
          const Icon = item.icon
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onChange(item.level)}
              className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-600/25 border-brand-500/70 text-white shadow-sm ring-1 ring-brand-500/30'
                  : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-600 hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold flex items-center gap-1">
                  <Icon className={`w-3 h-3 ${isSelected ? 'text-brand-300' : 'text-slate-400'}`} />
                  {item.title}
                </span>
                {isGameSession && (
                  <span
                    className={`text-[9px] font-mono px-1 rounded ${
                      item.level === 1
                        ? 'text-emerald-400 bg-emerald-950/40'
                        : 'text-amber-300 bg-amber-950/40'
                    }`}
                  >
                    {item.cost}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">
                {item.desc}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
export default HintLevelPicker
