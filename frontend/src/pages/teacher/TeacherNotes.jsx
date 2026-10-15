import { useEffect, useState } from 'react'
import { Plus, Sparkles, Check, BookOpen, Pencil, Upload, HardDrive, Globe } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LectureNotesImporterModal from '../../components/LectureNotesImporterModal'

function NoteCard({ note, onApprove }) {
  return (
    <div className="card p-5 flex flex-col gap-3 hover:border-brand-600/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{note.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date(note.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {note.ai_generated && <span className="badge-brand"><Sparkles className="w-3 h-3" />AI</span>}
          {note.status === 'draft'
            ? <span className="badge-amber">Draft</span>
            : <span className="badge-green">Published</span>}
        </div>
      </div>
      <p className="text-sm text-slate-400 line-clamp-2">{note.content.replace(/[#*`]/g, '').slice(0, 140)}…</p>
      {note.status === 'draft' && (
        <button
          id={`approve-note-${note.id}`}
          className="btn-primary w-full justify-center text-sm"
          onClick={() => onApprove(note.id)}
        >
          <Check className="w-4 h-4" /> Approve & Publish
        </button>
      )}
    </div>
  )
}

export default function TeacherNotes() {
  const [notes, setNotes]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [importerOpen, setImporterOpen] = useState(false)
  const [draftTopic, setDraftTopic] = useState('')
  const [draftLoading, setDraftLoading] = useState(false)
  const [draft, setDraft]         = useState(null)

  const fetchNotes = () => {
    api.get('/notes/?class_id=1')
       .then(r => setNotes(r.data))
       .catch(console.error)
       .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotes() }, [])

  const handleDraftAI = async () => {
    if (!draftTopic.trim()) return
    setDraftLoading(true)
    try {
      const { data } = await api.post(`/notes/draft-ai?topic=${encodeURIComponent(draftTopic)}`)
      setDraft(data)
    } catch {
      toast.error('Failed to generate draft')
    } finally {
      setDraftLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!draft) return
    try {
      await api.post('/notes/', {
        title: draft.title,
        content: draft.content,
        class_id: 1,
        status: 'draft',
      })
      toast.success('Draft saved – approve it to publish')
      setDraft(null)
      setDraftTopic('')
      fetchNotes()
    } catch {
      toast.error('Failed to save draft')
    }
  }

  const handleApprove = async (noteId) => {
    try {
      await api.post(`/notes/${noteId}/approve`)
      toast.success('Note published!')
      fetchNotes()
    } catch {
      toast.error('Failed to approve note')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-brand-400" /> Notes
          </h1>
          <p className="text-slate-500 mt-1">Create and manage class notes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all min-h-[38px]"
            onClick={() => setImporterOpen(true)}
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import Notes (Drive / Explorer)</span>
          </button>
          <button id="new-note-btn" className="btn-primary text-xs py-2 px-3.5 rounded-xl min-h-[38px]" onClick={() => setShowForm(v => !v)}>
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>
      </div>

      {/* AI Draft Panel */}
      {showForm && (
        <div className="card p-6 mb-6 border-brand-600/30 animate-slide-up">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand-400" /> Draft with AI
          </h2>
          <div className="flex gap-3 mb-4">
            <input
              id="draft-topic-input"
              className="input flex-1"
              placeholder="Enter a topic, e.g. 'Python lists and indexing'"
              value={draftTopic}
              onChange={e => setDraftTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDraftAI()}
            />
            <button
              id="generate-draft-btn"
              className="btn-primary whitespace-nowrap"
              onClick={handleDraftAI}
              disabled={draftLoading}
            >
              {draftLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Sparkles className="w-4 h-4" />}
              Generate
            </button>
          </div>

          {draft && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <span className="badge-amber flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> AI Draft – Review before saving</span>
                {draft.sources && draft.sources.length > 0 && (
                  <span className="text-[11px] text-teal-300 font-medium">
                    Grounded in: {Array.from(new Set(draft.sources.map(s => s.note_title))).join(', ')}
                  </span>
                )}
              </div>
              <h3 className="text-white font-semibold mb-2">{draft.title}</h3>
              <pre className="text-sm text-slate-400 whitespace-pre-wrap font-sans line-clamp-6">
                {draft.content}
              </pre>
              <div className="flex gap-3 mt-4">
                <button id="save-draft-btn" className="btn-primary text-sm" onClick={handleSaveDraft}>
                  <Check className="w-4 h-4" /> Save as Draft
                </button>
                <button className="btn-ghost text-sm" onClick={() => setDraft(null)}>
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes grid */}
      {loading ? (
        <div className="text-center text-slate-500 py-12">Loading notes…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {notes.map(note => (
            <NoteCard key={note.id} note={note} onApprove={handleApprove} />
          ))}
        </div>
      )}

      {/* ─── LECTURE NOTES IMPORTER MODAL ─── */}
      <LectureNotesImporterModal
        isOpen={importerOpen}
        onClose={() => setImporterOpen(false)}
        activeCourseName="Artificial Intelligence · 12-AI"
        onNoteImported={async (imported) => {
          try {
            await api.post('/notes/', {
              title: imported.title,
              content: typeof imported.content === 'string' ? imported.content : JSON.stringify(imported.content, null, 2),
              class_id: 1,
              status: 'published',
            })
            fetchNotes()
          } catch {
            // fallback local add
            setNotes(prev => [
              {
                id: Date.now(),
                title: imported.title,
                content: typeof imported.content === 'string' ? imported.content : imported.content.executiveSummary,
                created_at: new Date().toISOString(),
                ai_generated: imported.mode === 'ai',
                status: 'published',
              },
              ...prev
            ])
          }
        }}
      />
    </div>
  )
}
