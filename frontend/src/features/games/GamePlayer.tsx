import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Clock, Gamepad2, AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react'
import useGameSession from './useGameSession'
import FillBlankGame from './templates/FillBlankGame'
import BugHuntGame from './templates/BugHuntGame'
import OrderStepsGame from './templates/OrderStepsGame'
import SessionSummary from './SessionSummary'
import ChallengeRunner from '../visualizer/ChallengeRunner'
import HelperDrawer from '../helper/HelperDrawer'

export const GamePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [helperOpen, setHelperOpen] = useState(false)

  const {
    loading,
    error,
    sessionId,
    gameTitle,
    gameType,
    maxPoints,
    clientContent,
    hintsUsed,
    durationSec,
    isFinished,
    finishSummary,
    submitAnswer,
    useHint,
    finishSession,
  } = useGameSession(id || '')

  const handleExit = () => {
    if (isFinished) {
      navigate('/games')
      return
    }
    setShowExitConfirm(true)
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <span className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Loading game session...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 card text-center space-y-4 border-red-500/30">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Cannot Start Game</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        <button
          onClick={() => navigate('/games')}
          className="btn-primary text-xs py-2 px-5 mx-auto"
        >
          Back to Games
        </button>
      </div>
    )
  }

  if (isFinished && finishSummary) {
    return (
      <SessionSummary
        summary={finishSummary}
        gameTitle={gameTitle}
        onPlayAgain={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Full-Focus Minimal Header */}
      <header className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{gameTitle}</h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="capitalize">{gameType.replace('_', ' ')}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-500" /> {durationSec}s
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Study Helper trigger */}
          <button
            type="button"
            onClick={() => setHelperOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600/20 text-brand-300 border border-brand-500/30 hover:bg-brand-600/30 transition-all flex items-center gap-1.5"
            title="Open AI Study Helper"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Helper</span>
          </button>

          {/* Exit button */}
          <button
            type="button"
            onClick={handleExit}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
            title="Exit game"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Dynamic Game Template Content */}
      <div className="card p-6 md:p-8 bg-surface-card border-surface-border shadow-xl">
        {gameType === 'fill_blank' && clientContent && (
          <FillBlankGame
            content={clientContent}
            onSubmitAnswer={submitAnswer}
            onComplete={finishSession}
            hintsUsed={hintsUsed}
            onUseHint={useHint}
          />
        )}

        {gameType === 'bug_hunt' && clientContent && (
          <BugHuntGame
            content={clientContent}
            onSubmitAnswer={submitAnswer}
            onComplete={finishSession}
            hintsUsed={hintsUsed}
            onUseHint={useHint}
          />
        )}

        {gameType === 'order_steps' && clientContent && (
          <OrderStepsGame
            content={clientContent}
            onSubmitAnswer={submitAnswer}
            onComplete={finishSession}
            hintsUsed={hintsUsed}
            onUseHint={useHint}
          />
        )}

        {(gameType === 'visualizer' || gameType === 'code_visualizer') && clientContent && (
          <ChallengeRunner
            game={{
              id: parseInt(id || '0', 10),
              title: gameTitle,
              max_points: maxPoints,
              content_json: JSON.stringify(clientContent),
            }}
            onComplete={async (score, acc) => {
              await finishSession()
            }}
          />
        )}
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 max-w-sm w-full space-y-4 bg-surface-card border-surface-border text-center shadow-2xl">
            <h4 className="text-base font-bold text-white">Leave this challenge?</h4>
            <p className="text-xs text-slate-400">
              Your in-progress session will not be graded until completed.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="btn-ghost text-xs py-2 px-4 border border-surface-border"
              >
                Keep Playing
              </button>
              <button
                type="button"
                onClick={() => navigate('/games')}
                className="btn-danger text-xs py-2 px-4"
              >
                Exit Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Study Helper Drawer */}
      <HelperDrawer
        isOpen={helperOpen}
        onClose={() => setHelperOpen(false)}
        classId={1}
        gameId={parseInt(id || '0', 10)}
        sessionId={sessionId || undefined}
        isGameSession={true}
      />
    </div>
  )
}
export default GamePlayer
