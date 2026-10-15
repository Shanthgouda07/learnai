/**
 * GamePlayer – routes to the correct game template based on game_type.
 * Phase 1 stub: shows a placeholder for each type.
 * Full implementations come in Phase 4 & 5.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Gamepad2, Star } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import ChallengeRunner from '../../features/visualizer/ChallengeRunner'

function FillBlankGame({ game, onComplete }) {
  const content  = JSON.parse(game.content_json)
  const [answers, setAnswers] = useState({})
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    // Simple scoring: 100pts / num_blanks per correct blank
    const blanks = content.blanks || []
    const correct = blanks.filter(b => {
      const ans = (answers[b.index] || '').trim().toLowerCase()
      return ans === b.answer.toLowerCase()
    }).length
    const score = Math.round((correct / Math.max(blanks.length, 1)) * game.max_points)
    const accuracy = correct / Math.max(blanks.length, 1)
    await onComplete(score, accuracy)
    setDone(true)
  }

  if (done) return null

  return (
    <div className="space-y-6">
      <p className="text-slate-300">{content.instructions}</p>
      <pre className="bg-black/50 border border-surface-border rounded-xl p-4 text-sm font-mono text-slate-300 whitespace-pre-wrap">
        {content.template}
      </pre>
      <div className="space-y-3">
        {(content.blanks || []).map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-slate-500 text-sm w-20">Blank {b.index + 1}:</span>
            <input
              id={`blank-${i}`}
              className="input flex-1"
              placeholder={b.label}
              value={answers[b.index] || ''}
              onChange={e => setAnswers(a => ({ ...a, [b.index]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <button id="submit-game-btn" className="btn-primary" onClick={handleSubmit}>
        Submit Answers
      </button>
    </div>
  )
}

function BugHuntGame({ game, onComplete }) {
  const content = JSON.parse(game.content_json)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const handleSubmit = async () => {
    const correct = selected === content.buggy_line_idx
    await onComplete(correct ? game.max_points : 0, correct ? 1 : 0)
    setRevealed(true)
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-300">{content.instructions}</p>
      <div className="rounded-xl overflow-hidden border border-surface-border">
        {(content.lines || []).map((line, i) => (
          <button
            key={i}
            id={`bug-line-${i}`}
            className={`w-full text-left px-4 py-3 font-mono text-sm border-b border-surface-border last:border-0 transition-colors ${
              revealed && i === content.buggy_line_idx ? 'bg-red-600/20 text-red-300' :
              selected === i ? 'bg-amber-600/20 text-amber-300' :
              'hover:bg-surface-hover text-slate-300'
            }`}
            onClick={() => !revealed && setSelected(i)}
          >
            <span className="text-slate-600 mr-4 select-none">{i + 1}</span>
            {line}
          </button>
        ))}
      </div>
      {revealed ? (
        <div className="p-4 bg-surface rounded-xl border border-surface-border text-sm text-slate-300">
          💡 {content.explanation}
        </div>
      ) : (
        <button id="submit-bug-btn" className="btn-primary" onClick={handleSubmit} disabled={selected === null}>
          Flag This Line as Buggy
        </button>
      )}
    </div>
  )
}

function OrderStepsGame({ game, onComplete }) {
  const content = JSON.parse(game.content_json)
  const [order, setOrder] = useState(() => content.steps.map((_, i) => i))
  const [submitted, setSubmitted] = useState(false)

  const move = (i, dir) => {
    setOrder(prev => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const handleSubmit = async () => {
    const correct = order.every((v, i) => v === content.correct_order[i])
    await onComplete(correct ? game.max_points : Math.round(game.max_points * 0.4), correct ? 1 : 0.4)
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-300">{content.instructions}</p>
      <div className="space-y-2">
        {order.map((stepIdx, pos) => (
          <div key={pos} className="flex items-center gap-3 bg-surface border border-surface-border rounded-xl px-4 py-3">
            <span className="text-slate-600 text-sm w-6">{pos + 1}.</span>
            <code className="flex-1 text-sm text-slate-300 font-mono">{content.steps[stepIdx]}</code>
            {!submitted && (
              <div className="flex flex-col gap-0.5">
                <button className="btn-ghost py-0.5 px-1 text-xs" onClick={() => move(pos, -1)}>▲</button>
                <button className="btn-ghost py-0.5 px-1 text-xs" onClick={() => move(pos, +1)}>▼</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!submitted && (
        <button id="submit-order-btn" className="btn-primary" onClick={handleSubmit}>
          Submit Order
        </button>
      )}
    </div>
  )
}

function PlaceholderGame({ game, onComplete }) {
  const content = JSON.parse(game.content_json)
  return (
    <div className="space-y-4">
      <p className="text-slate-300">{content.instructions}</p>
      <div className="bg-black/40 border border-surface-border rounded-xl p-4 font-mono text-sm text-slate-300">
        {content.starter_code}
      </div>
      <p className="text-slate-500 text-sm italic">Full Code Visualizer coming in Phase 5.</p>
      <button id="complete-game-btn" className="btn-primary" onClick={() => onComplete(75, 0.75)}>
        Mark Complete (demo)
      </button>
    </div>
  )
}

export default function GamePlayer() {
  const { gameId } = useParams()
  const navigate   = useNavigate()
  const [game, setGame]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [summary, setSummary]   = useState(null)
  const [startTime]             = useState(Date.now())

  useEffect(() => {
    api.get(`/games/?class_id=1`)
       .then(r => setGame(r.data.find(g => g.id === parseInt(gameId))))
       .catch(console.error)
       .finally(() => setLoading(false))
  }, [gameId])

  const handleComplete = async (score, accuracy) => {
    const duration = Math.round((Date.now() - startTime) / 1000)
    try {
      await api.post('/games/sessions', {
        game_id:   parseInt(gameId),
        score,
        max_score: game.max_points,
        accuracy,
        duration,
      })
      setSummary({ score, accuracy, duration })
    } catch {
      toast.error('Failed to save session')
    }
  }

  if (loading) return <div className="text-center text-slate-500 py-12">Loading game…</div>
  if (!game)   return <div className="text-center text-red-400 py-12">Game not found</div>

  if (summary) {
    return (
      <div className="max-w-lg mx-auto text-center animate-slide-up py-16">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
        <p className="text-slate-500 mb-8">Great work on {game.title}</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Score',    value: `${summary.score} pts`, icon: '⭐' },
            { label: 'Accuracy', value: `${(summary.accuracy * 100).toFixed(0)}%`, icon: '🎯' },
            { label: 'Time',     value: `${summary.duration}s`, icon: '⏱️' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card p-4">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-white font-bold">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <button className="btn-primary" onClick={() => setSummary(null)}>Play Again</button>
          <button className="btn-ghost"   onClick={() => navigate('/student/games')}>Back to Games</button>
        </div>
      </div>
    )
  }

  if (game.game_type === 'visualizer' || game.game_type === 'code_visualizer') {
    return (
      <div className="animate-fade-in max-w-6xl mx-auto space-y-4">
        <button
          id="back-to-games"
          onClick={() => navigate('/student/games')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Games
        </button>
        <ChallengeRunner game={game} onComplete={handleComplete} />
      </div>
    )
  }

  const GameComponent = {
    fill_blank:      FillBlankGame,
    bug_hunt:        BugHuntGame,
    order_steps:     OrderStepsGame,
    code_visualizer: PlaceholderGame,
  }[game.game_type] || PlaceholderGame

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <button
        id="back-to-games"
        onClick={() => navigate('/student/games')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Games
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center">
          <Gamepad2 className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{game.title}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" /> Up to {game.max_points} points
          </p>
        </div>
      </div>

      <div className="card p-6">
        <GameComponent game={game} onComplete={handleComplete} />
      </div>
    </div>
  )
}
