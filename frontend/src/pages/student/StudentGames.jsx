import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Gamepad2, Lock, CheckCircle2 } from 'lucide-react'
import api from '../../services/api'

const TYPE_LABELS = {
  fill_blank:      { label: 'Fill the Blank', emoji: '✏️' },
  bug_hunt:        { label: 'Bug Hunt',        emoji: '🐛' },
  order_steps:     { label: 'Order Steps',     emoji: '📋' },
  code_visualizer: { label: 'Code Visualizer', emoji: '⚡' },
  visualizer:      { label: 'Code Visualizer', emoji: '⚡' },
}

export default function StudentGames() {
  const [games, setGames]     = useState([])
  const [progress, setProgress] = useState([])
  const [unlockMap, setUnlockMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/games/?class_id=1'),
      api.get('/progress/'),
    ]).then(async ([g, p]) => {
      setGames(g.data)
      setProgress(p.data)
      // Check unlock status for each game
      const map = {}
      await Promise.all(g.data.map(async game => {
        try {
          const { data } = await api.get(`/games/${game.id}/unlock-status`)
          map[game.id] = data.unlocked
        } catch {
          map[game.id] = false
        }
      }))
      setUnlockMap(map)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <Gamepad2 className="w-7 h-7 text-brand-400" /> Games
        </h1>
        <p className="text-slate-500 mt-1">Pass the note quiz to unlock games</p>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {games.map(game => {
            const unlocked = unlockMap[game.id]
            const meta     = TYPE_LABELS[game.game_type] || { label: game.game_type, emoji: '🎮' }
            return unlocked ? (
              <Link
                key={game.id}
                to={`/student/games/${game.id}`}
                id={`game-card-${game.id}`}
                className="card p-6 hover:border-brand-600/40 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl">{meta.emoji}</div>
                  <span className="badge-green text-xs">{meta.label}</span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors mb-1">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-500">Up to {game.max_points} points</p>
              </Link>
            ) : (
              <div key={game.id} className="card p-6 opacity-60 cursor-not-allowed">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-2xl filter grayscale">{meta.emoji}</div>
                  <Lock className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-500 mb-1">{game.title}</h3>
                <p className="text-xs text-slate-600">
                  🔒 Read and pass the linked note first
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
