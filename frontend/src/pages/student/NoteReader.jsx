import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BookOpen, CheckCircle2, AlertCircle, Sparkles, ChevronLeft,
  Volume2, Sliders, FileText
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import HelperDrawer from '../../features/helper/HelperDrawer'
import ReadAloudButton from '../../components/ReadAloudButton'
import { AiBadge } from '../../components/Badge'
import { useAccessibilityStore } from '../../store/accessibilityStore'

/**
 * Comprehension check panel – 2 questions, must get all correct to pass.
 */
function QuizPanel({ noteId, quizzes, onPass }) {
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quizzes.length) {
      toast.error('Answer all questions first')
      return
    }
    setSubmitting(true)
    try {
      const ansArr = quizzes.map((_, i) => answers[i] ?? -1)
      const { data } = await api.post(
        `/progress/submit-check?note_id=${noteId}`,
        ansArr
      )
      setResult(data)
      if (data.passed) onPass()
    } catch {
      toast.error('Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="notebook-card p-6 mt-8 border-[var(--color-teal)]">
      <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-5 h-5 text-[var(--color-teal)]" />
        <span>Comprehension Check</span>
      </h2>
      <p className="text-xs text-[var(--color-ink-muted)] mb-6">
        Answer both questions correctly to unlock the linked practice challenges.
      </p>

      <div className="space-y-6">
        {quizzes.map((q, qi) => {
          const opts = JSON.parse(q.options)
          return (
            <div key={q.id}>
              <p className="text-sm font-semibold text-[var(--color-ink)] mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {opts.map((opt, oi) => {
                  const selected = answers[qi] === oi
                  const correctIdx = result?.correct_indices ? result.correct_indices[qi] : q.answer_idx
                  const isCorrect = result && oi === correctIdx
                  const isWrong   = result && selected && oi !== correctIdx
                  return (
                    <button
                      key={oi}
                      id={`quiz-${qi}-opt-${oi}`}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${
                        isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold' :
                        isWrong   ? 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300' :
                        selected  ? 'bg-[var(--color-teal-wash)] border-[var(--color-teal)] text-[var(--color-teal)] font-semibold' :
                        'bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-border-subtle)]'
                      }`}
                      onClick={() => !result?.passed && setAnswers(a => ({ ...a, [qi]: oi }))}
                    >
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          id="submit-quiz-btn"
          className="notebook-btn-primary text-xs py-2.5 px-6"
          onClick={handleSubmit}
          disabled={submitting || result?.passed}
        >
          {submitting ? 'Checking...' : 'Submit Answers'}
        </button>
      </div>
    </div>
  )
}

export default function NoteReader() {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [helperOpen, setHelperOpen] = useState(false)
  const [showSimplified, setShowSimplified] = useState(false)
  const [simplifiedContent, setSimplifiedContent] = useState('')
  const [loadingSimplified, setLoadingSimplified] = useState(false)

  const { simpleLanguage } = useAccessibilityStore()

  const fetchAll = () => {
    Promise.all([
      api.get(`/notes/${noteId}`),
      api.get(`/notes/${noteId}/quiz`),
      api.get('/progress/'),
    ]).then(([n, q, p]) => {
      setNote(n.data)
      setQuizzes(q.data)
      const prog = p.data.find(x => x.note_id === parseInt(noteId))
      setProgress(prog || null)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [noteId])

  // Automatically fetch simplified summary if simple language toggle is on
  useEffect(() => {
    if (simpleLanguage && !simplifiedContent && noteId) {
      setLoadingSimplified(true)
      api.get(`/notes/${noteId}/simplify`)
        .then(res => {
          setSimplifiedContent(res.data.simplified_content)
          setShowSimplified(true)
        })
        .catch(console.warn)
        .finally(() => setLoadingSimplified(false))
    }
  }, [simpleLanguage, noteId, simplifiedContent])

  const toggleSimplifiedView = async () => {
    if (!simplifiedContent) {
      setLoadingSimplified(true)
      try {
        const res = await api.get(`/notes/${noteId}/simplify`)
        setSimplifiedContent(res.data.simplified_content)
        setShowSimplified(true)
      } catch (e) {
        toast.error('Could not load simplified summary')
      } finally {
        setLoadingSimplified(false)
      }
    } else {
      setShowSimplified(!showSimplified)
    }
  }

  if (loading) return <div className="text-center text-[var(--color-ink-muted)] py-12">Loading note…</div>
  if (!note)   return <div className="text-center text-rose-500 py-12">Note not found</div>

  const passed = progress?.read_check_passed
  const activeContent = showSimplified && simplifiedContent ? simplifiedContent : note.content

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6 py-6 px-4">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            id="back-to-notes"
            onClick={() => navigate('/student/notes')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors touch-target"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Notes
          </button>
          <button
            onClick={() => navigate('/student')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors py-1 px-2.5 rounded-lg bg-purple-500/10 border border-purple-500/25"
            title="Open all curriculum pages simultaneously in the student dashboard"
          >
            <Sparkles className="w-3.5 h-3.5" /> All Pages View
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Read Aloud Button */}
          <ReadAloudButton text={activeContent} label="Listen to Note" />

          {/* Simple Language Toggle */}
          <button
            type="button"
            onClick={toggleSimplifiedView}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 touch-target ${
              showSimplified
                ? 'bg-[var(--color-teal-wash)] border-[var(--color-teal)] text-[var(--color-teal)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] text-[var(--color-ink)]'
            }`}
            title="Toggle simplified reading level"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--color-teal)]" />
            <span>{showSimplified ? 'Standard Note' : 'Simple Summary'}</span>
            {showSimplified && <AiBadge label="Simplified" className="text-[9px] py-0 px-1.5" />}
          </button>

          {/* Ask AI Study Helper */}
          <button
            type="button"
            onClick={() => setHelperOpen(true)}
            className="notebook-btn-primary text-xs py-1.5 px-3 shadow-sm"
            title="Open AI Study Helper"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Helper</span>
          </button>
        </div>
      </div>

      {/* Simplified Mode Active Banner */}
      {showSimplified && (
        <div className="p-3.5 rounded-xl bg-[var(--color-teal-wash)] border border-[var(--color-teal)] text-xs text-[var(--color-teal)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AiBadge label="AI Simple Language" />
            <span>Showing curriculum concepts rewritten for simplified, accessible reading.</span>
          </div>
          <button
            onClick={() => setShowSimplified(false)}
            className="underline font-semibold text-xs ml-2 hover:opacity-80"
          >
            Switch to full text
          </button>
        </div>
      )}

      {/* Passed Banner */}
      {passed && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">
            You've passed the recall check for this note! Practice game challenges are unlocked.
          </span>
        </div>
      )}

      {/* Note Content */}
      <article className="notebook-card p-6 sm:p-10 shadow-lg prose-dark bg-[var(--color-card)] text-[var(--color-ink)]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {activeContent}
        </ReactMarkdown>
      </article>

      {/* Comprehension Quiz */}
      {quizzes.length > 0 && !passed && (
        <QuizPanel noteId={parseInt(noteId)} quizzes={quizzes} onPass={fetchAll} />
      )}

      {/* AI Study Helper Drawer */}
      <HelperDrawer
        isOpen={helperOpen}
        onClose={() => setHelperOpen(false)}
        classId={note.class_id || 1}
        noteId={parseInt(noteId)}
        isGameSession={false}
      />
    </div>
  )
}
