import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, CheckCircle2, Lock, Sparkles, Volume2, VolumeX,
  FileCheck, Download, ChevronRight, ChevronLeft, Brain, Lightbulb, Search,
  Check, Copy, ArrowUpRight, Shield, Zap, Flame, Terminal, Code2,
  ListFilter, ExternalLink, HelpCircle, AlertTriangle, ArrowRight, ArrowLeft,
  Cpu, Compass, Layers, CheckCheck, Play, Award, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { AiBadge } from '../../components/Badge'
import StudentAiAssistant from '../../components/StudentAiAssistant'
import InteractiveCompiler from '../../components/InteractiveCompiler'
import AssignmentSubmissionModal from '../../components/AssignmentSubmissionModal'
import { CURRICULUM_DATASETS } from '../../data/curriculumDatasets'

export default function StudentNotes() {
  // Active subject selection
  const [selectedSubjectKey, setSelectedSubjectKey] = useState('ai')
  const activeDataset = CURRICULUM_DATASETS[selectedSubjectKey] || CURRICULUM_DATASETS.ai

  // Dedicated Unit Selection (Chapter-by-Chapter navigation instead of single page dump)
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0)
  const [completedPages, setCompletedPages] = useState({})
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [selectedSubtopicTab, setSelectedSubtopicTab] = useState(0)

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Assignment submission & automated AI grader state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [gradedAssignments, setGradedAssignments] = useState({})

  // Claude Agent state
  const [claudeOpen, setClaudeOpen] = useState(false)
  const [claudeTopic, setClaudeTopic] = useState('AI Foundations')
  const [claudeUnitTitle, setClaudeUnitTitle] = useState('')
  const [claudePrompt, setClaudePrompt] = useState('')

  const allUnits = activeDataset?.units || []
  const currentUnit = allUnits[selectedUnitIndex] || allUnits[0]

  // Reset unit index when subject changes
  const handleSelectSubject = (key) => {
    setSelectedSubjectKey(key)
    setSelectedUnitIndex(0)
    setSelectedSubtopicTab(0)
    setSelectedQuizAnswer(null)
    setQuizSubmitted(false)
    if (isSpeaking) {
      window.speechSynthesis?.cancel()
      setIsSpeaking(false)
    }
  }

  // Calculate overall reading progress
  const completedCount = Object.keys(completedPages).filter(
    (k) => k.startsWith(`${selectedSubjectKey}:`) && completedPages[k]
  ).length
  const progressPercent = allUnits.length > 0 ? Math.round((completedCount / allUnits.length) * 100) : 0

  const handleMarkPageComplete = (unitId, unitTitle) => {
    const key = `${selectedSubjectKey}:${unitId}`
    const isNowDone = !completedPages[key]
    setCompletedPages((prev) => ({
      ...prev,
      [key]: isNowDone,
    }))
    if (isNowDone) {
      toast.success(`🎉 Completed ${unitTitle}! +50 XP awarded!`, { icon: '⭐' })
    }
  }

  // Keyboard navigation for previous/next units
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' && selectedUnitIndex < allUnits.length - 1) {
        setSelectedUnitIndex((prev) => prev + 1)
        setSelectedSubtopicTab(0)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (e.key === 'ArrowLeft' && selectedUnitIndex > 0) {
        setSelectedUnitIndex((prev) => prev - 1)
        setSelectedSubtopicTab(0)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedUnitIndex, allUnits.length])

  // Unit-specific Text-to-Speech audio
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in this browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const pov = currentUnit?.aiPerspective?.coreThesis || ''
    const overview = currentUnit?.whatToRead?.overview || currentUnit?.originalPdfNotes?.fullOverview || ''
    const subtopicSummaries = (currentUnit?.subtopics || []).map((s) => `${s.title}: ${s.concept}`).join('. ')

    const script = `${currentUnit?.title}. AI perspective: ${pov}. Overview: ${overview}. Topics covered in this unit: ${subtopicSummaries}`

    const utterance = new SpeechSynthesisUtterance(script)
    utterance.rate = 0.95
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
    toast.success(`Reading "${currentUnit?.title}" aloud...`)
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopiedId(null), 1800)
  }

  const exportCurrentUnitMarkdown = () => {
    const pov = currentUnit?.aiPerspective || {}
    const s = currentUnit?.simplifiedAiNotes || {}
    let md = `# ${currentUnit?.title}\n\n`
    md += `*Course: ${activeDataset?.fullTitle} · Topic: ${currentUnit?.topicKey} · Est. ${currentUnit?.estimatedMinutes || 20} mins*\n\n---\n\n`
    md += `## 🤖 AI Perspective & Architectural Synthesis\n${pov.coreThesis || ''}\n\n`
    md += `**Compiler & Machine Representation:**\n${pov.compilerBehavior || pov.machineRepresentation || ''}\n\n`
    md += `## 📚 Chapter Topics Breakdown\n\n`
    ;(currentUnit?.subtopics || []).forEach((sub) => {
      md += `### ${sub.title}\n${sub.concept}\n\n`
      md += `**Under the Hood:** ${sub.underlyingMechanism}\n\n`
      if (sub.codeSnippet) {
        md += `\`\`\`${activeDataset?.compilerLang || 'python'}\n${sub.codeSnippet}\n\`\`\`\n\n`
      }
      md += `*Takeaway: ${sub.keyTakeaway}*\n\n`
    })

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentUnit?.id || 'unit'}_ai_study_notes.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported complete AI notes for ${currentUnit?.title}!`)
  }

  const openClaudeForTopic = (prompt) => {
    setClaudeUnitTitle(currentUnit?.title || 'Chapter Study Notes')
    setClaudeTopic(currentUnit?.topicKey || activeDataset?.name)
    setClaudePrompt(prompt)
    setClaudeOpen(true)
  }

  const isCurrentUnitDone = completedPages[`${selectedSubjectKey}:${currentUnit?.id}`]
  const pov = currentUnit?.aiPerspective || {}
  const subtopics = currentUnit?.subtopics || []
  const currentSubtopic = subtopics[selectedSubtopicTab] || subtopics[0]

  return (
    <div className="relative animate-fade-in max-w-[1240px] mx-auto space-y-6 pb-16">
      {/* ─── TOP HERO HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-inner">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold font-display text-[var(--color-ink)]">
              AI Classroom Notebook & Complete Curriculum
            </h1>
            <span className="badge text-xs bg-cyan-500/15 text-cyan-300 font-mono">
              Dedicated Unit View
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1">
            Exhaustive chapter-by-chapter AI summaries, all topics included, interactive multi-platform terminal, and in-built code sandbox.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleToggleAudio}
            aria-label="Toggle text to speech audio"
            className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[40px] ${
              isSpeaking
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-[var(--color-card)] border-[var(--color-border)] text-[var(--color-ink)] hover:border-cyan-400/50'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isSpeaking ? 'Stop Reading' : 'Listen to Unit'}</span>
          </button>

          <button
            type="button"
            onClick={exportCurrentUnitMarkdown}
            aria-label="Export notes as Markdown"
            className="py-2 px-3.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-ink)] hover:text-cyan-300 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all min-h-[40px]"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export AI Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setAssignmentModalOpen(true)}
            aria-label="Submit Assignment"
            className="py-2 px-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[40px]"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Submit Assignment (Photo/Notes)</span>
          </button>

          <button
            type="button"
            onClick={() => openClaudeForTopic(`Please explain the core thesis and key mechanisms of ${currentUnit?.title} from an AI point of view.`)}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 flex items-center gap-2 min-h-[40px] transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Ask Socratic AI</span>
          </button>
        </div>
      </div>

      {/* ─── COURSE / SUBJECT SELECTOR TABS ─── */}
      <div className="card p-3 bg-[var(--color-card)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold uppercase text-cyan-400">
            Active Syllabus:
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: 'ai',     label: '🧠 Artificial Intelligence & ML', code: '12-AI' },
              { key: 'python', label: '🐍 Python Foundations',           code: '9-A' },
              { key: 'java',   label: '☕ Java OOP & 24CSEN1011',        code: '10-B' },
              { key: 'iot',    label: '📡 Internet of Things & Sensors', code: '11-A' },
            ].map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => handleSelectSubject(s.key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedSubjectKey === s.key
                    ? 'bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-[var(--color-card)] border-cyan-400 text-cyan-300 font-bold shadow-md'
                    : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-cyan-400/40'
                }`}
              >
                <span>{s.label}</span>
                <span className="opacity-60 font-mono text-[10px] ml-1.5">· {s.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Subject Progress */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[var(--color-ink-muted)]">
            Course Mastery: <b className="text-cyan-400">{completedCount} of {allUnits.length} Units</b> ({progressPercent}%)
          </span>
          <div className="w-24 h-2 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── DEDICATED CHAPTER NAVIGATION RAIL (NOT IN A SINGLE PAGE!) ─── */}
      <div className="card p-3 bg-[var(--color-card)]/95 backdrop-blur-md border border-[var(--color-border)] shadow-md space-y-2.5">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-[var(--color-ink)]">Select Chapter to Read:</span>
            <span className="text-slate-400 text-[11px]">(Dedicated standalone view per unit)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={selectedUnitIndex === 0}
              onClick={() => {
                setSelectedUnitIndex((prev) => Math.max(0, prev - 1))
                setSelectedSubtopicTab(0)
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--color-bg)] border border-[var(--color-border)] disabled:opacity-40 text-[var(--color-ink)] hover:border-cyan-400/50 flex items-center gap-1 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev Unit</span>
            </button>

            <span className="font-mono text-cyan-400 text-xs px-2">
              Unit {selectedUnitIndex + 1} of {allUnits.length}
            </span>

            <button
              type="button"
              disabled={selectedUnitIndex === allUnits.length - 1}
              onClick={() => {
                setSelectedUnitIndex((prev) => Math.min(allUnits.length - 1, prev + 1))
                setSelectedSubtopicTab(0)
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--color-bg)] border border-[var(--color-border)] disabled:opacity-40 text-[var(--color-ink)] hover:border-cyan-400/50 flex items-center gap-1 transition-all"
            >
              <span>Next Unit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Chapter Stepper Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {allUnits.map((u, idx) => {
            const isDone = completedPages[`${selectedSubjectKey}:${u.id}`]
            const isCurrent = idx === selectedUnitIndex
            return (
              <button
                key={u.id || idx}
                type="button"
                onClick={() => {
                  setSelectedUnitIndex(idx)
                  setSelectedSubtopicTab(0)
                  setSelectedQuizAnswer(null)
                  setQuizSubmitted(false)
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                  isCurrent
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                    : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-cyan-400/40'
                }`}
              >
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[10px] ${
                  isDone ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-300'
                }`}>
                  {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : idx + 1}
                </span>
                <span>{u.title}</span>
                {isDone && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ─── DEDICATED UNIT STANDALONE VIEW ─── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        {/* Chapter Header Banner */}
        <div className="card p-6 bg-gradient-to-r from-purple-950/25 via-[#090D1A] to-cyan-950/25 border border-cyan-500/30 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge text-[11px] bg-purple-500/20 text-purple-300 border-purple-500/40 font-mono">
                  {currentUnit?.originalPdfNotes?.moduleHeader || `${activeDataset?.fullTitle} · Chapter ${selectedUnitIndex + 1}`}
                </span>
                <span className="badge text-[11px] bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-mono">
                  Topic: {currentUnit?.topicKey}
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  ⏱️ {currentUnit?.estimatedMinutes || 20} min read
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
                {currentUnit?.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => handleMarkPageComplete(currentUnit?.id, currentUnit?.title)}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                isCurrentUnitDone
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-cyan-400'
              }`}
            >
              {isCurrentUnitDone ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Mastered (+50 XP)</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Mark Unit Completed</span>
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {currentUnit?.originalPdfNotes?.fullOverview || currentUnit?.whatToRead?.overview}
          </p>
        </div>

        {/* ─── 🤖 COMPLETE AI PERSPECTIVE & ARCHITECTURAL SYNTHESIS ─── */}
        <section className="card p-6 bg-[#090E1E] border border-cyan-500/30 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  Full AI Perspective & Architectural Point of View
                </h3>
                <p className="text-[11px] text-slate-400">
                  How compilers, neural engines, and artificial intelligence models conceptualize and execute this unit.
                </p>
              </div>
            </div>
            <span className="badge text-[10px] uppercase font-mono bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
              Grounded AI Synthesis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Core Thesis */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono uppercase">
                <Cpu className="w-3.5 h-3.5" />
                1. Computational Core Thesis
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {pov.coreThesis || currentUnit?.simplifiedAiNotes?.eli5 || currentUnit?.whatToRead?.overview}
              </p>
            </div>

            {/* Compiler & Machine Representation */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5 font-mono uppercase">
                <Layers className="w-3.5 h-3.5" />
                2. Compiler & Runtime Bytecode Behavior
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {pov.compilerBehavior || pov.machineRepresentation || currentUnit?.deepDiveArchitecture || 'Executes via optimized instruction offsets and machine register allocations.'}
              </p>
            </div>
          </div>

          {/* Big Picture Why */}
          {pov.bigPictureWhy && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent border border-cyan-500/20 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-cyan-300">The Big Picture (Why it matters): </span>
                {pov.bigPictureWhy}
              </div>
            </div>
          )}
        </section>

        {/* ─── 📚 EXHAUSTIVE CHAPTER TOPICS BREAKDOWN ─── */}
        <section className="card p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold font-display text-[var(--color-ink)]">
                  All Topics in This Chapter ({subtopics.length} Subtopics)
                </h3>
              </div>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Every topic from this syllabus chapter broken down in full depth with theory, mechanisms, code, and takeaways.
              </p>
            </div>
          </div>

          {/* Subtopics Pill Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {subtopics.map((sub, idx) => (
              <button
                key={sub.id || idx}
                type="button"
                onClick={() => setSelectedSubtopicTab(idx)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  selectedSubtopicTab === idx
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-sm'
                    : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-cyan-400/40'
                }`}
              >
                <span>{sub.title}</span>
              </button>
            ))}
          </div>

          {/* Selected Subtopic Deep-Dive Card */}
          {currentSubtopic && (
            <div className="p-5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-base font-bold font-display text-[var(--color-ink)] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">
                    {selectedSubtopicTab + 1}
                  </span>
                  {currentSubtopic.title}
                </h4>
                <span className="badge text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono">
                  Subtopic {selectedSubtopicTab + 1} of {subtopics.length}
                </span>
              </div>

              {/* Concept & Mechanism */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <p className="leading-relaxed">
                  <b className="text-white">Core Concept: </b>
                  {currentSubtopic.concept}
                </p>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    Underlying System Mechanism:
                  </div>
                  <div className="text-slate-300 leading-relaxed">
                    {currentSubtopic.underlyingMechanism}
                  </div>
                </div>
              </div>

              {/* Subtopic Code Snippet with "Send to Interactive Terminal" Button */}
              {currentSubtopic.codeSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      Annotated Code Pattern
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentSubtopic.codeSnippet, `sub-${selectedSubtopicTab}`)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        {copiedId === `sub-${selectedSubtopicTab}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === `sub-${selectedSubtopicTab}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#05070E] border border-white/15 overflow-x-auto font-mono text-xs text-cyan-300 leading-relaxed shadow-inner">
                    <pre>{currentSubtopic.codeSnippet}</pre>
                  </div>
                </div>
              )}

              {/* Key Takeaway */}
              {currentSubtopic.keyTakeaway && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5 text-xs text-emerald-300">
                  <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><b>Key Takeaway:</b> {currentSubtopic.keyTakeaway}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ─── 💡 AI ANALOGIES & ARCHITECTURE DEEP DIVE (ELI5) ─── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-md space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono uppercase">
              <Lightbulb className="w-4 h-4" />
              Real-World Analogy (ELI5)
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentUnit?.simplifiedAiNotes?.analogy || currentUnit?.simplifiedAiNotes?.eli5 || 'Think of this architecture like a dynamic pipeline routing inputs through deterministic transformers.'}
            </p>
          </div>

          <div className="card p-5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-md space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono uppercase">
              <AlertTriangle className="w-4 h-4" />
              AI Gotcha & Trap Warning
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentUnit?.simplifiedAiNotes?.trapWarning || currentUnit?.whatToRead?.keyTakeaway || 'Ensure types match across function boundary calls to prevent runtime type errors.'}
            </p>
          </div>
        </section>

        {/* ─── 💻 IN-BUILT INTERACTIVE TERMINAL & MULTI-PLATFORM SANDBOX ─── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold font-display text-[var(--color-ink)]">
                Interactive Terminal & Multi-Platform Compiler Sandbox
              </h3>
            </div>
            <span className="badge text-[10px] bg-emerald-500/15 text-emerald-300 font-mono">
              In-Built Code Ready
            </span>
          </div>

          <InteractiveCompiler
            initialCode={
              currentUnit?.allCodeSnippets?.[0]?.code ||
              currentUnit?.compilerChallenge?.initialCode ||
              currentUnit?.whatToRead?.codeSnippet ||
              'print("LearnAI Interactive Terminal Ready")'
            }
            expectedOutput={
              currentUnit?.allCodeSnippets?.[0]?.expectedOutput ||
              currentUnit?.compilerChallenge?.expectedOutput ||
              ''
            }
            language={activeDataset?.compilerLang || 'python'}
            title={`${currentUnit?.title} · Code Sandbox`}
            description="All code from this unit is loaded and runnable. Test with standard input, challenge test cases, or inspect variable memory frames."
            unitSnippets={currentUnit?.allCodeSnippets || []}
            onRewardXP={(xp) => {
              toast.success(`🎉 +${xp} XP Earned in ${currentUnit?.title}!`, { icon: '⭐' })
            }}
            onAskAI={(codeContext) => openClaudeForTopic(codeContext)}
          />
        </section>

        {/* ─── 📝 CHAPTER ASSIGNMENT & AUTOMATED AI GRADER CARD ─── */}
        <section className="card p-6 bg-gradient-to-r from-[#070B16] via-[var(--color-card)] to-[#070B16] border border-cyan-500/30 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  Chapter Assignment & Automated AI Grader
                </h3>
                <p className="text-xs text-slate-400">
                  Write notes directly or take a picture of your handwritten homework to receive automatic AI approval & marks.
                </p>
              </div>
            </div>

            {gradedAssignments[`${selectedSubjectKey}:${currentUnit?.id}`] ? (
              <span className="badge bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Score: {gradedAssignments[`${selectedSubjectKey}:${currentUnit?.id}`].marks} / 10 (Approved)
              </span>
            ) : (
              <span className="badge bg-amber-500/15 text-amber-300 border-amber-500/30 font-mono text-[11px]">
                Submission Pending
              </span>
            )}
          </div>

          {gradedAssignments[`${selectedSubjectKey}:${currentUnit?.id}`] ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Assignment Verified & Approved by AI Engine!
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Marks Awarded: <b>{gradedAssignments[`${selectedSubjectKey}:${currentUnit?.id}`].marks} / 10</b> (Grade {gradedAssignments[`${selectedSubjectKey}:${currentUnit?.id}`].grade}) · +100 XP Earned
                </p>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Feedback: {gradedAssignments[`${selectedSubjectKey}:${currentUnit?.id}`].aiFeedback}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignmentModalOpen(true)}
                className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all"
              >
                View Full Rubric & Submission
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-white">
                  Assignment Task: Solve & Explain {currentUnit?.title}
                </div>
                <div className="text-[11px] text-slate-400">
                  Complete the problem set in your physical notebook, take a photo or type your explanation, and submit for instant AI review.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAssignmentModalOpen(true)}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 shadow-md flex items-center gap-1.5 transition-all shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Submit Assignment (Photo / Notes)</span>
              </button>
            </div>
          )}
        </section>

        {/* ─── 🎯 ACTIVE RECALL GATE & SELF-ASSESSMENT ─── */}
        {currentUnit?.quiz && (
          <section className="card p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold font-display text-[var(--color-ink)]">
                  Active Recall Check: Verify Your Chapter Mastery
                </h3>
              </div>
              <span className="badge bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono">
                +{currentUnit.quiz.rewardXP || 50} XP
              </span>
            </div>

            <p className="text-sm font-semibold text-white">
              {currentUnit.quiz.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentUnit.quiz.options?.map((opt, optIdx) => {
                const isSelected = selectedQuizAnswer === optIdx
                const isCorrect = optIdx === currentUnit.quiz.correctIndex
                let btnStyle = 'bg-[var(--color-bg)] border-[var(--color-border)] text-slate-300 hover:border-cyan-400'

                if (quizSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => {
                      if (!quizSubmitted) setSelectedQuizAnswer(optIdx)
                    }}
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm text-left transition-all ${btnStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              {!quizSubmitted ? (
                <button
                  type="button"
                  disabled={selectedQuizAnswer === null}
                  onClick={() => {
                    setQuizSubmitted(true)
                    if (selectedQuizAnswer === currentUnit.quiz.correctIndex) {
                      toast.success('🎉 Correct Answer! +50 XP awarded!', { icon: '⭐' })
                      handleMarkPageComplete(currentUnit?.id, currentUnit?.title)
                    } else {
                      toast.error('Not quite! Check the explanation below.')
                    }
                  }}
                  className="py-2 px-5 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950 disabled:opacity-40 hover:bg-cyan-300 transition-all"
                >
                  Submit Answer
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 w-full flex items-center justify-between">
                  <div>
                    <b className="text-cyan-300">Explanation: </b>
                    {currentUnit.quiz.explanation}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizSubmitted(false)
                      setSelectedQuizAnswer(null)
                    }}
                    className="ml-3 text-cyan-400 hover:underline font-semibold shrink-0"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── CHAPTER PAGINATION FOOTER ─── */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            disabled={selectedUnitIndex === 0}
            onClick={() => {
              setSelectedUnitIndex((prev) => Math.max(0, prev - 1))
              setSelectedSubtopicTab(0)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[var(--color-card)] border border-[var(--color-border)] disabled:opacity-30 text-[var(--color-ink)] hover:border-cyan-400 flex items-center gap-2 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400">Previous Chapter</div>
              <div className="font-bold">{allUnits[selectedUnitIndex - 1]?.title || 'Beginning'}</div>
            </div>
          </button>

          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            Unit {selectedUnitIndex + 1} of {allUnits.length} · Use ◄ / ► arrow keys to turn chapters
          </div>

          <button
            type="button"
            disabled={selectedUnitIndex === allUnits.length - 1}
            onClick={() => {
              setSelectedUnitIndex((prev) => Math.min(allUnits.length - 1, prev + 1))
              setSelectedSubtopicTab(0)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-[var(--color-card)] border border-[var(--color-border)] disabled:opacity-30 text-[var(--color-ink)] hover:border-cyan-400 flex items-center gap-2 transition-all shadow-sm"
          >
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Next Chapter</div>
              <div className="font-bold">{allUnits[selectedUnitIndex + 1]?.title || 'End of Course'}</div>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── SOCRATIC AI ASSISTANT SLIDEOUT DRAWER ─── */}
      <StudentAiAssistant
        isOpen={claudeOpen}
        onClose={() => setClaudeOpen(false)}
        activeSubject={activeDataset?.name}
        activeUnitTitle={claudeUnitTitle || currentUnit?.title}
        activeTopic={claudeTopic}
        initialPrompt={claudePrompt}
      />

      {/* ─── ASSIGNMENT SUBMISSION & AI GRADER MODAL ─── */}
      <AssignmentSubmissionModal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        unitTitle={currentUnit?.title}
        topicKey={currentUnit?.topicKey}
        onAssignmentGraded={(result) => {
          setGradedAssignments((prev) => ({
            ...prev,
            [`${selectedSubjectKey}:${currentUnit?.id}`]: result,
          }))
          handleMarkPageComplete(currentUnit?.id, currentUnit?.title)
        }}
      />
    </div>
  )
}

