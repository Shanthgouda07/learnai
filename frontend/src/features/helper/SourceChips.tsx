import React from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface SourceChipItem {
  note_title: string
  heading?: string
}

interface SourceChipsProps {
  sources: SourceChipItem[]
  onNavigateToNote?: (noteTitle: string) => void
}

export const SourceChips: React.FC<SourceChipsProps> = ({ sources, onNavigateToNote }) => {
  const navigate = useNavigate()

  if (!sources || sources.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
      <span className="text-[10px] text-slate-400 font-medium">From:</span>
      {sources.map((src, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => {
            if (onNavigateToNote) {
              onNavigateToNote(src.note_title)
            } else {
              navigate('/student/notes')
            }
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800 text-teal-300 border border-teal-500/30 hover:bg-slate-700 hover:border-teal-400 transition-colors"
          title={`Read section: ${src.note_title} - ${src.heading || 'Overview'}`}
        >
          <BookOpen className="w-2.5 h-2.5 text-teal-400 shrink-0" />
          <span className="truncate max-w-[140px]">
            {src.note_title}
            {src.heading && src.heading !== 'Overview' ? ` (${src.heading})` : ''}
          </span>
          <ExternalLink className="w-2 h-2 text-teal-400 opacity-60 shrink-0" />
        </button>
      ))}
    </div>
  )
}
export default SourceChips
