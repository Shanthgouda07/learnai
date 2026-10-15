import React, { useState, useEffect } from 'react'
import {
  FileText, Sparkles, Bot, Columns2, Download, ExternalLink,
  Volume2, VolumeX, Search, Copy, Check, ChevronRight,
  BookOpen, Brain, Lightbulb, AlertTriangle, ArrowRight,
  Maximize2, Eye, ShieldAlert, Cpu, Layers, CheckCircle2,
  FileCheck, ListOrdered, Share2, HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function NotesPdfViewer({
  unit,
  dataset,
  onAskAI,
  onSelectUnit,
  onRewardXP,
  showAllSimultaneously = false,
  onToggleSimultaneous
}) {
  // Mode: 'single' | 'all'
  const [isSimultaneous, setIsSimultaneous] = useState(showAllSimultaneously)

  // View mode per unit / global: 'simplified' | 'original' | 'split'
  const [viewMode, setViewMode] = useState('simplified')

  // AI Simplicity level: 'eli5' | 'standard' | 'deep'
  const [simplicityLevel, setSimplicityLevel] = useState('standard')

  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // All pages completion state
  const [allPagesCompleted, setAllPagesCompleted] = useState(false)
  const [showCheatSheetModal, setShowCheatSheetModal] = useState(false)

  // Synchronize prop changes
  useEffect(() => {
    setIsSimultaneous(showAllSimultaneously)
  }, [showAllSimultaneously])

  const allUnits = dataset?.units || (unit ? [unit] : [])
  const currentUnit = unit || allUnits[0]

  if (!currentUnit && allUnits.length === 0) return null

  const getPdfUrl = (u) => {
    if (!u) return '/notes/python_foundations_notes.pdf'
    return u.pdfUrl || (dataset?.id === 'java'
      ? (u.unitNumber >= 4 ? '/notes/java_module5_exceptions.pdf' : '/notes/java_module4_interfaces.pdf')
      : dataset?.id === 'iot' ? '/notes/iot_mqtt_notes.pdf' : '/notes/python_foundations_notes.pdf')
  }

  // Safe Speech Synthesis for single or continuous all pages
  const handleToggleSpeak = (text) => {
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
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const handleSpeakAllPages = () => {
    if (!('speechSynthesis' in window)) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const fullScript = allUnits.map((u, i) => {
      const s = u.simplifiedAiNotes || {}
      return `Page ${i + 1}: ${u.title}. Real-world analogy: ${s.analogy || u.whatToRead?.overview}. Key points: ${(s.keyBullets || u.whatToRead?.keyConcepts || []).join('. ')}. Warning: ${s.trapWarning || u.whatToRead?.keyTakeaway || ''}.`
    }).join(' Next topic: ')

    handleToggleSpeak(fullScript)
  }

  const handleCopyNotes = (text) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    toast.success('Notes copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // Mark all pages complete simultaneously
  const handleCompleteAllPages = async () => {
    try {
      await api.post('/notes/mark-all-read').catch(() => null)
    } catch (e) {
      // Mock / offline fallback
    }

    setAllPagesCompleted(true)
    if (onRewardXP) {
      onRewardXP(150, 'Mastered all curriculum pages simultaneously!')
    }
    toast.success(`🎉 All ${allUnits.length} pages completed simultaneously! +150 XP awarded!`, {
      duration: 4000,
      icon: '✨'
    })
  }

  // Export all simplified notes as Markdown
  const handleExportMarkdown = () => {
    const md = `# ${dataset?.name || 'Curriculum'} – Complete AI-Simplified Notes\n\n`
      + `*Level: ${simplicityLevel.toUpperCase()} · Total Pages: ${allUnits.length} · Grounded in Verified Curriculum*\n\n---\n\n`
      + allUnits.map((u, idx) => {
        const s = u.simplifiedAiNotes || {}
        return `## Page ${idx + 1}: ${u.title}\n\n`
          + `### 💡 Real-World Metaphor (ELI5)\n${s.analogy || u.whatToRead?.overview}\n\n`
          + `### ⚡ High-Yield Key Points\n`
          + (s.keyBullets || u.whatToRead?.keyConcepts || []).map(b => `- ${b}`).join('\n') + `\n\n`
          + `### 💻 Annotated Code Pattern\n\`\`\`${dataset?.language || 'python'}\n${u.whatToRead?.codeSnippet || ''}\n\`\`\`\n\n`
          + `### ⚠️ Common Exam Trap / Bug\n${s.trapWarning || u.whatToRead?.keyTakeaway || ''}\n\n---\n`
      }).join('\n')

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${dataset?.id || 'course'}_all_simplified_notes.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported all simplified notes to Markdown!')
  }

  // Filter units based on search query
  const filteredUnits = searchQuery.trim()
    ? allUnits.filter(u =>
        u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.whatToRead?.overview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.simplifiedAiNotes?.keyBullets?.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allUnits

  return (
    <div className="card p-0 overflow-hidden border border-[var(--bd)] bg-[var(--s1)] shadow-xl animate-fade-in">
      {/* ─── TOP MASTER BAR: MODE SWITCHER & SIMULTANEOUS TOGGLE ─── */}
      <div className="p-3 bg-[var(--s2)] border-b border-[var(--bd)] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Title & Page Count */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--tx)] font-display">
                {isSimultaneous ? `${dataset?.name || 'Curriculum'}: Complete All Pages View` : currentUnit.title}
              </span>
              <span className="badge text-[10px] bg-cyan-500/15 text-cyan-300 font-mono">
                {isSimultaneous ? `${allUnits.length} Pages Stream` : `${currentUnit.estimatedMinutes || 15} min read`}
              </span>
              {allPagesCompleted && (
                <span className="badge text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  All Pages Mastered
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--mu)]">
              {dataset?.name} · {isSimultaneous ? 'Simultaneous Multi-Page AI Notes Engine' : 'Module Reference Note'}
            </p>
          </div>
        </div>

        {/* Center: Scope Toggle (Single Page vs Simultaneous All Pages) */}
        <div className="flex items-center bg-[#05070D] p-1 rounded-xl border border-[var(--bd)] shadow-inner">
          <button
            type="button"
            id="single-page-mode-btn"
            onClick={() => {
              setIsSimultaneous(false)
              onToggleSimultaneous?.(false)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !isSimultaneous
                ? 'bg-cyan-400 text-[#05070D] shadow-sm font-bold'
                : 'text-[var(--mu)] hover:text-[var(--tx)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Single Page</span>
          </button>

          <button
            type="button"
            id="all-pages-simultaneous-btn"
            onClick={() => {
              setIsSimultaneous(true)
              onToggleSimultaneous?.(true)
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSimultaneous
                ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-sm font-bold'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Pages Simultaneously</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
              {allUnits.length}
            </span>
          </button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Complete All Pages Button */}
          <button
            type="button"
            id="complete-all-pages-btn"
            onClick={handleCompleteAllPages}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              allPagesCompleted
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
            }`}
            title="Mark all pages completed simultaneously and earn XP"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${allPagesCompleted ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">{allPagesCompleted ? 'All Pages Done (+150 XP)' : 'Complete All Pages (+150 XP)'}</span>
          </button>

          {/* Master Cheat Sheet Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowCheatSheetModal(true)}
            className="p-2 rounded-lg bg-[var(--s1)] border border-[var(--bd)] text-[var(--tx)] hover:border-cyan-400 text-xs flex items-center gap-1"
            title="View consolidated master cheat sheet of all pages"
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] hidden md:inline">Cheat Sheet</span>
          </button>

          {/* Audio Playback */}
          <button
            type="button"
            onClick={isSimultaneous ? handleSpeakAllPages : () => handleToggleSpeak(
              viewMode === 'simplified'
                ? ((currentUnit.simplifiedAiNotes?.eli5 || currentUnit.whatToRead?.overview) + '. ' + (currentUnit.simplifiedAiNotes?.keyBullets || currentUnit.whatToRead?.keyConcepts || []).join('. '))
                : (currentUnit.originalPdfNotes?.fullOverview || currentUnit.whatToRead?.overview)
            )}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              isSpeaking
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-[var(--s1)] border-[var(--bd)] text-[var(--tx)] hover:border-cyan-400'
            }`}
            title={isSpeaking ? 'Pause reading aloud' : isSimultaneous ? 'Read all pages simultaneously aloud' : 'Read notes aloud'}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="text-[11px] hidden sm:inline">{isSpeaking ? 'Stop Audio' : isSimultaneous ? 'Listen to All' : 'Listen'}</span>
          </button>

          {/* Export Markdown */}
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="p-2 rounded-lg bg-[var(--s1)] border border-[var(--bd)] text-[var(--tx)] hover:border-cyan-400 text-xs flex items-center gap-1"
            title="Export all simplified notes to Markdown"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ─── GLOBAL SIMPLIFICATION LEVEL & SEARCH TOOLBAR ─── */}
      <div className="px-4 py-2.5 bg-[var(--s1)] border-b border-[var(--bd)] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Simplicity Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[var(--mu)] font-medium">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] text-[var(--tx)]">Simplicity Level for All Pages:</span>
          </div>
          <div className="flex items-center gap-1">
            {[
              { id: 'eli5', label: '🐣 ELI5 (Analogy)', desc: 'Real-world metaphors & zero jargon' },
              { id: 'standard', label: '⚡ Standard', desc: 'Practical, high-yield classroom notes' },
              { id: 'deep', label: '🔬 Deep Dive', desc: 'Runtime memory model & architecture' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSimplicityLevel(lvl.id)}
                title={lvl.desc}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  simplicityLevel === lvl.id
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-500/40 shadow-sm'
                    : 'text-[var(--mu)] hover:text-[var(--tx)]'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search Filter across all pages */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[var(--mu)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts across all pages..."
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-[var(--s2)] border border-[var(--bd)] text-xs text-[var(--tx)] placeholder:text-[var(--mu)] focus:outline-none focus:border-cyan-400"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-[var(--mu)] hover:text-cyan-400 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MODE 1: ALL PAGES SIMULTANEOUSLY VIEW
          ══════════════════════════════════════════════════════════════════ */}
      {isSimultaneous ? (
        <div className="p-4 space-y-6 animate-fade-in">
          {/* Header Banner for Simultaneous View */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/30 via-[var(--s2)] to-cyan-950/20 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Simultaneous AI Simplified Curriculum View Active</span>
                  <span className="badge text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                    {filteredUnits.length} of {allUnits.length} Pages Shown
                  </span>
                </h4>
                <p className="text-[11px] text-[var(--mu)]">
                  All syllabus pages are synthesized simultaneously into accessible mental models, high-yield rules, and executable code snippets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCompleteAllPages}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark All Complete</span>
              </button>
            </div>
          </div>

          {/* Cards for each page simultaneously */}
          <div className="space-y-6">
            {filteredUnits.map((u, index) => {
              const simplified = u.simplifiedAiNotes || {
                eli5: u.whatToRead?.overview,
                analogy: 'Imagine this concept like a standard blueprint: every worker builds from the exact same plan.',
                keyBullets: u.whatToRead?.keyConcepts || [],
                trapWarning: u.whatToRead?.keyTakeaway,
                cheatSheet: u.whatToRead?.keyConcepts?.[0] || 'Key principle',
              }

              return (
                <div
                  key={u.id || index}
                  id={`page-card-${index + 1}`}
                  className="rounded-2xl border border-[var(--bd)] bg-[var(--s2)] p-4 space-y-4 hover:border-cyan-500/40 transition-all shadow-md group"
                >
                  {/* Page Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--bd)] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--tx)] group-hover:text-cyan-300 transition-colors">
                          {u.title}
                        </h3>
                        <p className="text-[11px] text-[var(--mu)]">
                          Topic: <span className="font-mono text-cyan-400">{u.topicKey || 'Foundations'}</span> · {u.estimatedMinutes || 15} min read
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onSelectUnit && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectUnit(index)
                            setIsSimultaneous(false)
                          }}
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 py-1 px-2 rounded-lg bg-[var(--s1)] border border-[var(--bd)] hover:border-cyan-400"
                        >
                          <span>Open in Single View</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {onAskAI && (
                        <button
                          type="button"
                          onClick={() => onAskAI(`Explain ${u.title} in simpler words with mathematical formulas and code proofs`)}
                          className="text-[11px] text-[#E58567] hover:text-[#FAF7F2] flex items-center gap-1 py-1 px-2.5 rounded-lg bg-[#D97757]/15 border border-[#D97757]/35 hover:bg-[#D97757]/25 transition-all shadow-sm"
                        >
                          <Sparkles className="w-3 h-3 text-[#D97757]" />
                          <span>Ask Claude Agent</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Level-Adaptive Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: AI Synthesis & High-Yield Bullets */}
                    <div className="space-y-3">
                      {/* Simplicity Level Text */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/20 to-[var(--s1)] border border-purple-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="badge text-[9px] bg-purple-500/20 text-purple-300 border-purple-500/30 font-mono">
                            🤖 AI Simplified Note ({simplicityLevel.toUpperCase()})
                          </span>
                        </div>

                        {simplicityLevel === 'eli5' && (
                          <div className="space-y-2 text-xs text-[var(--tx)]">
                            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs">
                              <strong className="block text-amber-300 mb-0.5">💡 Real-World Metaphor:</strong>
                              {simplified.analogy}
                            </div>
                            <p className="text-xs leading-relaxed text-[var(--tx)]">
                              {simplified.eli5 || u.whatToRead?.overview}
                            </p>
                          </div>
                        )}

                        {simplicityLevel === 'standard' && (
                          <div className="space-y-2 text-xs text-[var(--tx)]">
                            <p className="text-xs leading-relaxed text-[var(--tx)]">
                              {u.whatToRead?.overview}
                            </p>
                            <div className="p-2 rounded-lg bg-[var(--s2)] border border-[var(--bd)] text-xs text-cyan-300">
                              <strong>Key Principle: </strong>
                              {u.whatToRead?.keyTakeaway}
                            </div>
                          </div>
                        )}

                        {simplicityLevel === 'deep' && (
                          <div className="p-2.5 rounded-lg bg-[#05070D] border border-cyan-500/30 text-cyan-300 font-mono text-[11px] leading-relaxed">
                            <div className="text-amber-400 font-bold mb-1">// LOW-LEVEL RUNTIME PERSPECTIVE:</div>
                            {u.deepDiveArchitecture || 'Runtime memory allocation reserves stack frame storage and dispatches execution over instruction pointers.'}
                          </div>
                        )}
                      </div>

                      {/* High Yield Key Concepts */}
                      <div className="p-3 rounded-xl bg-[var(--s1)] border border-[var(--bd)] space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase">
                          <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Essential Concepts for Page {index + 1}:</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-[var(--tx)]">
                          {(simplified.keyBullets || u.whatToRead?.keyConcepts || []).map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2 p-1.5 rounded-lg bg-[var(--s2)] border border-[var(--bd)]">
                              <span className="p-0.5 px-1 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[9px] font-bold">
                                0{bIdx + 1}
                              </span>
                              <span className="leading-snug text-[11px]">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right: Code Architecture & Pitfall Alert */}
                    <div className="space-y-3">
                      {/* Code Snippet */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--mu)]">
                          <span className="flex items-center gap-1.5">
                            <Cpu className="w-3 h-3 text-cyan-400" />
                            <span>Annotated Code Pattern</span>
                          </span>
                          <span className="uppercase text-[10px]">{dataset?.language || 'Code'}</span>
                        </div>
                        <pre className="p-3 rounded-xl bg-[#05070D] border border-[var(--bd)] font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed shadow-inner max-h-44">
                          {u.whatToRead?.codeSnippet || '// No code snippet for this module'}
                        </pre>
                      </div>

                      {/* Trap & Pitfall Warning */}
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        <div>
                          <strong className="block text-rose-200 font-semibold mb-0.5">Common Exam Trap / Bug:</strong>
                          <span className="text-[11px]">{simplified.trapWarning || u.whatToRead?.keyTakeaway}</span>
                        </div>
                      </div>

                      {/* Quick Action Navigation Chips */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {u.quiz && onSelectUnit && (
                          <button
                            type="button"
                            onClick={() => onSelectUnit(index)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 flex items-center gap-1"
                          >
                            <span>Step 2: Recall Quiz (+{u.quiz.rewardXP || 50} XP)</span>
                          </button>
                        )}
                        {u.compilerChallenge && onSelectUnit && (
                          <button
                            type="button"
                            onClick={() => onSelectUnit(index)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 flex items-center gap-1"
                          >
                            <span>Step 4: Practice Sandbox</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Completion Bar */}
          <div className="p-4 rounded-2xl bg-[var(--s2)] border border-[var(--bd)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-[var(--tx)]">
                You've reviewed all {allUnits.length} curriculum pages simultaneously!
              </h4>
              <p className="text-[11px] text-[var(--mu)]">
                All pages are synchronized. You can mark all complete to unlock recall gates and game challenges.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCompleteAllPages}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark All Pages Mastered (+150 XP)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
            MODE 2: SINGLE PAGE VIEW (WITH DUAL SIMPLIFIED/ORIGINAL MODES)
            ══════════════════════════════════════════════════════════════════ */
        <div className="animate-fade-in">
          {/* Sub Header: View Mode Switcher (Simplified vs Original vs Split) */}
          <div className="px-4 py-2.5 bg-[var(--s2)] border-b border-[var(--bd)] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--mu)] font-medium">Page Mode:</span>
              <div className="flex items-center bg-[#05070D] p-0.5 rounded-lg border border-[var(--bd)]">
                <button
                  type="button"
                  onClick={() => setViewMode('simplified')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'simplified'
                      ? 'bg-cyan-400 text-[#05070D] font-bold shadow-sm'
                      : 'text-[var(--mu)] hover:text-[var(--tx)]'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI-Simplified</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('original')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                    viewMode === 'original'
                      ? 'bg-cyan-400 text-[#05070D] font-bold shadow-sm'
                      : 'text-[var(--mu)] hover:text-[var(--tx)]'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Original PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  title="Side-by-side comparison"
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold hidden md:flex items-center gap-1 transition-all ${
                    viewMode === 'split'
                      ? 'bg-cyan-400 text-[#05070D] font-bold shadow-sm'
                      : 'text-[var(--mu)] hover:text-[var(--tx)]'
                  }`}
                >
                  <Columns2 className="w-3 h-3" />
                  <span>Split View</span>
                </button>
              </div>
            </div>

            {/* Link to Simultaneous View */}
            <button
              type="button"
              onClick={() => {
                setIsSimultaneous(true)
                onToggleSimultaneous?.(true)
              }}
              className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 py-1 px-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30"
            >
              <Sparkles className="w-3 h-3" />
              <span>Switch to All Pages Simultaneously ({allUnits.length})</span>
            </button>
          </div>

          {/* Single Page Content */}
          <div className={`p-4 ${viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}`}>
            {/* AI Simplified Section */}
            {(viewMode === 'simplified' || viewMode === 'split') && (
              <div className="space-y-4 animate-fade-in">
                {/* AI Summary Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/20 to-[var(--s2)] border border-purple-500/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge text-[10px] bg-purple-500/20 text-purple-300 border-purple-500/40 font-mono">
                        🤖 AI Synthesis ({simplicityLevel.toUpperCase()})
                      </span>
                      <span className="text-[11px] text-[var(--mu)]">Grounded in curriculum notes</span>
                    </div>
                    {onAskAI && (
                      <button
                        type="button"
                        onClick={() => onAskAI(`Can you explain ${currentUnit.title} further with more real-world examples?`)}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Ask AI Clarification</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {simplicityLevel === 'eli5' && (
                    <div className="space-y-2 text-xs text-[var(--tx)] leading-relaxed">
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200">
                        <strong className="block text-amber-300 mb-1">💡 Real-World Metaphor:</strong>
                        {currentUnit.simplifiedAiNotes?.analogy || 'Think of this concept like an everyday blueprint: everyone builds from the exact same clear plan.'}
                      </div>
                      <p className="text-sm">
                        {currentUnit.simplifiedAiNotes?.eli5 || currentUnit.whatToRead?.overview}
                      </p>
                    </div>
                  )}

                  {simplicityLevel === 'standard' && (
                    <div className="space-y-2 text-xs text-[var(--tx)] leading-relaxed">
                      <p className="text-sm">
                        {currentUnit.whatToRead?.overview}
                      </p>
                      <div className="p-3 rounded-lg bg-[var(--s1)] border border-[var(--bd)] text-xs text-cyan-300">
                        <strong>Core Mental Model: </strong>
                        {currentUnit.whatToRead?.keyTakeaway}
                      </div>
                    </div>
                  )}

                  {simplicityLevel === 'deep' && (
                    <div className="space-y-2 text-xs text-[var(--tx)] leading-relaxed font-mono">
                      <div className="p-3 rounded-lg bg-[#05070D] border border-cyan-500/30 text-cyan-300 text-[11px]">
                        <div className="text-amber-400 font-bold mb-1">// LOW-LEVEL RUNTIME & MEMORY PERSPECTIVE:</div>
                        {currentUnit.deepDiveArchitecture || 'Runtime heap allocation manages symbol bindings and stack memory frames across execution cycles.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* High-Yield Key Points */}
                <div className="p-4 rounded-xl bg-[var(--s2)] border border-[var(--bd)] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase">
                    <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                    <span>High-Yield Concept Breakdown:</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[var(--tx)]">
                    {(currentUnit.simplifiedAiNotes?.keyBullets || currentUnit.whatToRead?.keyConcepts || []).map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-[var(--s1)] border border-[var(--bd)]">
                        <span className="p-1 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[10px] font-bold">
                          0{idx + 1}
                        </span>
                        <span className="leading-snug">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Code Walkthrough with annotations */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--mu)]">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      <span>Annotated Code Architecture</span>
                    </span>
                    <span className="uppercase">{dataset?.language || 'Code'}</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-[#05070D] border border-[var(--bd)] font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
                    {currentUnit.whatToRead?.codeSnippet}
                  </pre>
                </div>

                {/* AI Trap & Pitfall Alert */}
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <strong className="block text-rose-200 font-semibold mb-0.5">Common Exam Trap / Bug:</strong>
                    <span>{currentUnit.simplifiedAiNotes?.trapWarning || currentUnit.whatToRead?.keyTakeaway}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Original PDF Section */}
            {(viewMode === 'original' || viewMode === 'split') && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3 rounded-xl bg-[var(--s2)] border border-[var(--bd)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-[var(--tx)] font-mono">
                      Original Source: {getPdfUrl(currentUnit).split('/').pop()}
                    </span>
                  </div>
                  <a
                    href={getPdfUrl(currentUnit)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Raw PDF</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="rounded-xl overflow-hidden border border-[var(--bd)] bg-[#05070D] h-[480px] relative shadow-2xl">
                  <iframe
                    src={`${getPdfUrl(currentUnit)}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                    title="Original Syllabus PDF Viewer"
                    className="w-full h-full border-0"
                  />
                </div>

                {/* Full Original Slide / Transcript */}
                <div className="p-4 rounded-xl bg-[var(--s2)] border border-[var(--bd)] space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--bd)] pb-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                      Original Lecture & Syllabus Notes
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyNotes(currentUnit.originalPdfNotes?.fullTranscript || currentUnit.whatToRead?.overview)}
                      className="text-xs text-[var(--mu)] hover:text-cyan-400 flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>

                  <div className="text-xs text-[var(--tx)] space-y-2.5 leading-relaxed max-h-60 overflow-y-auto pr-2">
                    <p>
                      <strong>Course Module Header: </strong>
                      {currentUnit.originalPdfNotes?.moduleHeader || `${dataset?.code} · ${currentUnit.title}`}
                    </p>
                    <div className="p-3 rounded-lg bg-[var(--s1)] border border-[var(--bd)] font-mono text-[11px] leading-relaxed text-[var(--mu)]">
                      {currentUnit.originalPdfNotes?.fullTranscript || currentUnit.whatToRead?.overview}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL: CONSOLIDATED MASTER CHEAT SHEET ACROSS ALL PAGES ─── */}
      {showCheatSheetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="card max-w-4xl w-full max-h-[85vh] flex flex-col p-0 overflow-hidden border border-purple-500/40 shadow-2xl bg-[var(--s1)]">
            {/* Modal Header */}
            <div className="p-4 bg-[var(--s2)] border-b border-[var(--bd)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    Consolidated Master Cheat Sheet: {dataset?.name}
                  </h3>
                  <p className="text-xs text-[var(--mu)]">
                    All {allUnits.length} curriculum pages synthesized into high-yield exam rules.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCheatSheetModal(false)}
                className="text-xs text-[var(--mu)] hover:text-white p-1.5 rounded-lg hover:bg-[var(--s1)]"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body: Matrix Table */}
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--bd)] bg-[var(--s2)] text-cyan-300 font-mono">
                      <th className="p-3">Page / Unit</th>
                      <th className="p-3">Real-World Metaphor (ELI5)</th>
                      <th className="p-3">Key Syntax / Rule</th>
                      <th className="p-3">Exam Pitfall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--bd)]">
                    {allUnits.map((u, i) => {
                      const s = u.simplifiedAiNotes || {}
                      return (
                        <tr key={u.id || i} className="hover:bg-[var(--s2)]/50 transition-colors">
                          <td className="p-3 font-semibold text-[var(--tx)] whitespace-nowrap">
                            <span className="text-cyan-400 font-mono mr-1.5">0{i + 1}.</span>
                            {u.title.replace(/^Unit \d+:\s*/, '')}
                          </td>
                          <td className="p-3 text-[var(--mu)] max-w-xs">
                            {s.analogy || u.whatToRead?.overview}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-purple-300 max-w-xs">
                            {s.cheatSheet || s.keyBullets?.[0] || 'Standard syntax'}
                          </td>
                          <td className="p-3 text-rose-300 text-[11px] max-w-xs">
                            {s.trapWarning || u.whatToRead?.keyTakeaway}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[var(--s2)] border-t border-[var(--bd)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--mu)]">
                Generated with deterministic accuracy from teacher-approved curriculum notes.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-[var(--s1)] border border-[var(--bd)] text-xs text-[var(--tx)] hover:border-cyan-400 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download .MD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheatSheetModal(false)}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
