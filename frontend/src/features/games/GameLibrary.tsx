import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gamepad2, Lock, Unlock, BookOpen, Star, Play, ChevronRight, Award } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import api from '../../services/api'

interface GameItem {
  id: number
  class_id: number
  linked_note_id: number | null
  title: string
  game_type: string
  max_points: number
  status: string
  topic: string
  difficulty: number
  locked: boolean
  lock_reason: string | null
  best_score: number
  attempts_count: number
}

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  fill_blank: { label: 'Fill in the Blank', emoji: '✏️', color: 'badge-brand' },
  bug_hunt: { label: 'Bug Hunt', emoji: '🐛', color: 'badge-red' },
  order_steps: { label: 'Order the Steps', emoji: '📋', color: 'badge-amber' },
  visualizer: { label: 'Code Visualizer', emoji: '⚡', color: 'badge-green' },
  code_visualizer: { label: 'Code Visualizer', emoji: '⚡', color: 'badge-green' },
}

export const GameLibrary: React.FC = () => {
  const [games, setGames] = useState<GameItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    api.get('/games/?class_id=1')
      .then(res => setGames(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Group games by linked note (0, 1, 2 or unlinked)
  const groupedGames = games.reduce((acc, game) => {
    const key = game.linked_note_id ? `Note #${game.linked_note_id}` : 'General Practice'
    if (!acc[key]) acc[key] = []
    acc[key].push(game)
    return acc
  }, {} as Record<string, GameItem[]>)

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600/30 flex items-center justify-center border border-brand-500/30">
              <Gamepad2 className="w-6 h-6 text-brand-400" />
            </div>
            <span>Practice Challenges & Games</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Stepping-stone challenges unlocked as you master classroom notes
          </p>
        </div>

        <Link
          to="/visualizer"
          className="btn-ghost text-xs py-2 px-3.5 border border-surface-border text-teal-300 hover:text-teal-200"
        >
          <span>Open Code Sandbox</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading learning path...
        </div>
      ) : Object.keys(groupedGames).length === 0 ? (
        <div className="card p-12 text-center text-slate-400 text-sm">
          No practice challenges published yet.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedGames).map(([groupTitle, groupItems], groupIdx) => (
            <div key={groupTitle} className="space-y-4">
              {/* Stepping-stone Group Header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-card border border-surface-border flex items-center justify-center text-xs font-bold text-brand-400">
                  {groupIdx + 1}
                </div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  {groupTitle}
                </h2>
              </div>

              {/* Grid of game cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupItems.map(game => {
                  const cfg = TYPE_CONFIG[game.game_type] || {
                    label: game.game_type,
                    emoji: '🎮',
                    color: 'badge-slate',
                  }

                  if (game.locked) {
                    return (
                      <div
                        key={game.id}
                        className="card p-5 bg-surface/50 border-surface-border/60 opacity-60 flex flex-col justify-between space-y-4 cursor-pointer hover:border-amber-500/40 transition-all group"
                        onClick={() => {
                          if (game.linked_note_id) {
                            navigate(`/student/notes/${game.linked_note_id}`)
                          }
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="text-2xl filter grayscale">{cfg.emoji}</span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                              <Lock className="w-3 h-3 text-amber-400" />
                              <span>Locked</span>
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm text-slate-300">
                            {game.title}
                          </h3>
                        </div>

                        <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-amber-400/90 group-hover:text-amber-300">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Read note to unlock</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )
                  }

                  return (
                    <motion.div
                      key={game.id}
                      whileHover={reducedMotion ? {} : { y: -3 }}
                      className="card p-5 hover:border-brand-500/50 transition-all flex flex-col justify-between space-y-4 group bg-surface-card"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="text-2xl">{cfg.emoji}</span>
                          <span className={`text-[10px] ${cfg.color}`}>{cfg.label}</span>
                        </div>

                        <h3 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors">
                          {game.title}
                        </h3>

                        {/* Difficulty dots */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1">
                          <span>Difficulty:</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map(d => (
                              <div
                                key={d}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  d <= (game.difficulty || 1) ? 'bg-amber-400' : 'bg-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Best score & Play button */}
                      <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-400">
                          {game.attempts_count > 0 ? (
                            <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Best: {game.best_score}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">Unplayed</span>
                          )}
                        </div>

                        <Link
                          to={`/games/${game.id}`}
                          id={`play-game-${game.id}`}
                          className="btn-primary py-1.5 px-3.5 text-xs"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Play</span>
                        </Link>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default GameLibrary
