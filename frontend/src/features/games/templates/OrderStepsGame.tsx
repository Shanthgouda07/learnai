import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Check, AlertCircle, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'
import HintLadder from '../HintLadder'
import { ItemFeedback } from '../useGameSession'

interface OrderStepsGameProps {
  content: {
    prompt: string
    steps: string[]
    hints?: string[]
  }
  onSubmitAnswer: (itemId: string | number, response: any) => Promise<ItemFeedback | null>
  onComplete: () => void
  hintsUsed: number
  onUseHint: () => void
}

interface SortableItemProps {
  id: string
  stepText: string
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  isSubmitted: boolean
}

const SortableStepItem: React.FC<SortableItemProps> = ({
  id,
  stepText,
  index,
  total,
  onMoveUp,
  onMoveDown,
  isSubmitted,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-surface-card border rounded-2xl p-4 shadow-sm transition-all ${
        isDragging
          ? 'border-brand-500 bg-brand-950/40 z-20 scale-[1.02] shadow-xl'
          : 'border-surface-border hover:border-slate-500'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag handle"
        className="p-1 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing focus:outline-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Step index badge */}
      <span className="w-7 h-7 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-xs font-mono font-bold text-slate-400 select-none">
        {index + 1}
      </span>

      {/* Code snippet text */}
      <code className="flex-1 font-mono text-sm text-slate-200 select-none whitespace-pre-wrap">
        {stepText}
      </code>

      {/* Keyboard accessible up/down buttons */}
      <div className="flex flex-col gap-1 sm:flex-row">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0 || isSubmitted}
          aria-label={`Move step ${index + 1} up`}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover disabled:opacity-20"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1 || isSubmitted}
          aria-label={`Move step ${index + 1} down`}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover disabled:opacity-20"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export const OrderStepsGame: React.FC<OrderStepsGameProps> = ({
  content,
  onSubmitAnswer,
  onComplete,
  hintsUsed,
  onUseHint,
}) => {
  // Steps initially shuffled from server
  const [items, setItems] = useState<string[]>(() => content.steps || [])
  const [feedback, setFeedback] = useState<ItemFeedback | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems(curr => {
        const oldIndex = curr.indexOf(String(active.id))
        const newIndex = curr.indexOf(String(over.id))
        return arrayMove(curr, oldIndex, newIndex)
      })
      setFeedback(null)
    }
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= items.length) return
    setItems(curr => arrayMove(curr, index, newIndex))
    setFeedback(null)
  }

  const handleCheckOrder = async () => {
    setSubmitting(true)
    const res = await onSubmitAnswer(0, items)
    setSubmitting(false)

    if (res) {
      setFeedback(res)
      if (res.correct) {
        setTimeout(() => {
          onComplete()
        }, 1000)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-base font-bold text-white">{content.prompt}</h3>
        <p className="text-xs text-slate-400">
          Drag and drop or use the arrows to arrange the statements into the correct execution order.
        </p>
      </div>

      {/* Sortable List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {items.map((stepText, idx) => (
              <SortableStepItem
                key={stepText}
                id={stepText}
                stepText={stepText}
                index={idx}
                total={items.length}
                onMoveUp={() => handleMove(idx, -1)}
                onMoveDown={() => handleMove(idx, 1)}
                isSubmitted={submitting || (feedback && feedback.correct)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs ${
            feedback.correct
              ? 'bg-teal-950/30 border border-teal-500/40 text-teal-300'
              : 'bg-red-950/30 border border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.correct ? (
              <Check className="w-4 h-4 text-teal-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="font-semibold">{feedback.feedback}</span>
          </div>
          {feedback.explanation && (
            <span className="opacity-90">{feedback.explanation}</span>
          )}
        </div>
      )}

      {/* Hint Ladder */}
      {content.hints && content.hints.length > 0 && (
        <HintLadder
          hints={content.hints}
          revealedCount={hintsUsed}
          onReveal={onUseHint}
        />
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end pt-4 border-t border-surface-border">
        <button
          type="button"
          onClick={feedback && feedback.correct ? onComplete : handleCheckOrder}
          disabled={submitting}
          className="btn-primary py-2.5 px-6 text-sm"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          ) : feedback && feedback.correct ? (
            <>
              <span>Finish & View Score</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Check Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
export default OrderStepsGame
