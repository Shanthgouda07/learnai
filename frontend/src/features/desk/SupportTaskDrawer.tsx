import React, { useState, useEffect } from 'react'
import {
  X, Sparkles, Check, BookOpen, Gamepad2, AlertCircle, Eye, Edit3,
  Layers, Users, ShieldAlert, CheckCircle2
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface StudentOption {
  id: number
  anon_id: string
  name: string
}

interface SupportTaskDrawerProps {
  isOpen: boolean
  onClose: () => void
  classId: number
  initialStudents?: StudentOption[]
  initialTopic?: string
  availableStudents?: StudentOption[]
  onApproved?: () => void
}

export default function SupportTaskDrawer({
  isOpen,
  onClose,
  classId,
  initialStudents = [],
  initialTopic = 'variables',
  availableStudents = [],
  onApproved,
}: SupportTaskDrawerProps) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([])
  const [topic, setTopic] = useState<string>(initialTopic)
  const [taskKind, setTaskKind] = useState<'game' | 'note'>('game')
  const [gameType, setGameType] = useState<string>('fill_blank')
  const [instructions, setInstructions] = useState<string>('')
  
  const [generating, setGenerating] = useState(false)
  const [draft, setDraft] = useState<any>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [approving, setApproving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (initialStudents.length > 0) {
      setSelectedStudentIds(initialStudents.map((s) => s.id))
    }
    if (initialTopic) {
      setTopic(initialTopic)
    }
  }, [initialStudents, initialTopic])

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error('Please select at least one student.')
      return
    }

    setGenerating(true)
    setDraft(null)
    try {
      const resp = await api.post('/desk/support-task', {
        class_id: classId,
        student_ids: selectedStudentIds,
        kind: taskKind,
        game_type: gameType,
        topic: topic,
        teacher_instructions: instructions,
      })
      const d = resp.data
      setDraft(d)
      setEditedTitle(d.title || '')
      if (d.kind === 'note') {
        setEditedContent(d.content || '')
      } else {
        setEditedContent(JSON.stringify(d.content_json, null, 2))
      }
      toast.success('AI Draft generated! Review and customize below.')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate support task.')
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = async () => {
    if (!draft) return
    setApproving(true)
    try {
      let payloadContent: any = {}
      if (draft.kind === 'note') {
        payloadContent = {
          class_id: classId,
          kind: 'note',
          title: editedTitle,
          content: editedContent,
        }
      } else {
        let parsedJson = {}
        try {
          parsedJson = JSON.parse(editedContent)
        } catch {
          parsedJson = draft.content_json
        }
        payloadContent = {
          class_id: classId,
          kind: 'game',
          title: editedTitle,
          content_json: parsedJson,
        }
      }

      await api.post(`/desk/support-task/${draft.draft_id}/approve`, payloadContent)
      toast.success('Support task approved and assigned to targeted student(s)!')
      onApproved?.()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to approve task.')
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white">Targeted Support Task Builder</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              AI drafts grounded in approved notes. Teacher reviews, edits and approves before assignment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Students */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Users className="inline w-3.5 h-3.5 mr-1 text-brand-400" />
              Target Student(s) (Multi-Select Supported)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableStudents.map((st) => {
                const isSelected = selectedStudentIds.includes(st.id)
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedStudentIds(selectedStudentIds.filter((id) => id !== st.id))
                      } else {
                        setSelectedStudentIds([...selectedStudentIds, st.id])
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-brand-600/20 text-brand-300 border-brand-500/50 shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                    }`}
                  >
                    {st.name} <span className="opacity-60 text-[10px]">({st.anon_id})</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target Concept & Kind */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Topic (Root Cause)
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-brand-500"
              >
                <option value="variables">Variables</option>
                <option value="loops">Loops</option>
                <option value="conditionals">Conditionals</option>
                <option value="functions">Functions</option>
                <option value="lists">Lists</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Task Format
              </label>
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setTaskKind('game')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    taskKind === 'game' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5" /> Interactive Game
                </button>
                <button
                  type="button"
                  onClick={() => setTaskKind('note')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    taskKind === 'note' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Targeted Note
                </button>
              </div>
            </div>
          </div>

          {taskKind === 'game' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Game Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'fill_blank', label: 'Fill the Blank' },
                  { id: 'bug_hunt', label: 'Bug Hunt' },
                  { id: 'order_steps', label: 'Order Steps' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setGameType(tpl.id)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      gameType === tpl.id
                        ? 'bg-brand-600/20 text-brand-300 border-brand-500/50'
                        : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:text-slate-200'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teacher instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Teacher Instructions (Optional Guidance)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Focus on accumulator pattern with gentle numbers"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-brand-500"
            />
          </div>

          {/* Generate Button */}
          <div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || selectedStudentIds.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-900/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Drafting grounded task with AI...' : 'Generate Targeted Draft'}
            </button>
          </div>

          {/* Generated Draft Review & Edit */}
          {draft && (
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="badge-brand">AI-Generated Draft</span>
                  <span className="text-xs text-slate-400">
                    Grounded in approved class notes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-300 hover:text-brand-200"
                >
                  {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {previewMode ? 'Edit Draft' : 'Preview Student View'}
                </button>
              </div>

              {/* Grounded & Generated because meta */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-xs space-y-1 text-slate-300">
                <div>
                  <span className="text-slate-400 font-medium">Targeted Students:</span>{' '}
                  <span className="font-mono text-brand-300">
                    {draft.target_student_anon_ids?.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Root Cause:</span>{' '}
                  <span className="capitalize font-semibold text-amber-300">{draft.topic}</span>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium outline-none focus:border-brand-500"
                />
              </div>

              {/* Content / Editor */}
              {previewMode ? (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <h4 className="font-bold text-white mb-2">{editedTitle}</h4>
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                    {editedContent}
                  </pre>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    {draft.kind === 'note' ? 'Markdown Content' : 'Challenge Payload (JSON)'}
                  </label>
                  <textarea
                    rows={8}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 outline-none focus:border-brand-500"
                  />
                </div>
              )}

              {/* Approve & Assign Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approving}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {approving ? 'Assigning...' : 'Approve & Assign to Targeted Student(s)'}
                </button>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  Once approved, only the targeted student(s) will see this in their library.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
