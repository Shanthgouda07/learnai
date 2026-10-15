import React, { useState, useEffect } from 'react'
import StarfieldSky from '../../components/StarfieldSky'
import KnowledgeMap from '../../components/KnowledgeMap'
import InteractiveCompiler from '../../components/InteractiveCompiler'
import StudentAiAssistant from '../../components/StudentAiAssistant'
import NotesPdfViewer from '../../components/NotesPdfViewer'
import { CURRICULUM_DATASETS } from '../../data/curriculumDatasets'
import { useAuthStore } from '../../store/authStore'
import api from '../../services/api'
import {
  BookOpen, Gamepad2, Code2, Sparkles, CheckCircle2,
  Award, Play, Flame, Zap, ArrowRight, Bot, Shield,
  Layers, Volume2, RotateCcw, AlertTriangle, HelpCircle
} from 'lucide-react'

const cap = (t) => t ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''
const pc = (m) => m === null || m === undefined ? 'No data' : `${Math.round(m * 100)}%`

export default function StudentDashboard() {
  const { user } = useAuthStore()

  // Selected Curriculum Dataset ('python' | 'java' | 'iot')
  const [activeDatasetKey, setActiveDatasetKey] = useState('python')
  const activeDataset = CURRICULUM_DATASETS[activeDatasetKey] || CURRICULUM_DATASETS.python

  // Active view tab ('lessons' | 'graph' | 'compiler')
  const [activePortalTab, setActivePortalTab] = useState('lessons')

  // Selected Unit inside lesson plan
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0)

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Leveled game active level (1, 2, or 3)
  const [activeGameLevel, setActiveGameLevel] = useState(1)
  const [completedLevels, setCompletedLevels] = useState({})

  // Points & Rewards state
  const [earnedXP, setEarnedXP] = useState(240)
  const [streakDays, setStreakDays] = useState(3)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  // AI Assistant state
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // Knowledge Map nodes state
  const [datasetNodes, setDatasetNodes] = useState({
    ai:     { ...CURRICULUM_DATASETS.ai?.nodes },
    python: { ...CURRICULUM_DATASETS.python.nodes },
    java:   { ...CURRICULUM_DATASETS.java.nodes },
    iot:    { ...CURRICULUM_DATASETS.iot.nodes },
  })
  const [selectedTopic, setSelectedTopic] = useState('loops')
  const [unlockedTopics, setUnlockedTopics] = useState({})
  const [showAllPages, setShowAllPages] = useState(false)

  const currentUnit = activeDataset.units[selectedUnitIndex] || activeDataset.units[0]

  const showToast = (msg) => {
    setToastMessage(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2800)
  }

  const addXP = (amount, reason) => {
    setEarnedXP((prev) => prev + amount)
    showToast(`+${amount} XP Earned! ${reason}`)
  }

  const handleAnswerQuiz = (index) => {
    if (quizSubmitted) return
    setSelectedQuizAnswer(index)
    setQuizSubmitted(true)

    if (index === currentUnit.quiz.correctIndex) {
      addXP(currentUnit.quiz.rewardXP, 'Quiz passed on first attempt!')
      // Ignite concept star in constellation
      setUnlockedTopics((prev) => ({
        ...prev,
        [`${activeDatasetKey}:${currentUnit.topicKey}`]: true,
      }))
    } else {
      showToast('Review the lesson note and try again.')
    }
  }

  const handleCompleteLevel = (lvl) => {
    setCompletedLevels((prev) => ({
      ...prev,
      [`${activeDatasetKey}:${currentUnit.id}:${lvl.level}`]: true,
    }))
    addXP(lvl.xp, `${lvl.levelName} Mastered!`)
  }

  const handleDatasetChange = (key) => {
    setActiveDatasetKey(key)
    setSelectedUnitIndex(0)
    setSelectedQuizAnswer(null)
    setQuizSubmitted(false)
    showToast(`Loaded ${CURRICULUM_DATASETS[key].name} Universe`)
  }

  // TTS Read Aloud simulation
  const handleReadAloud = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      window.speechSynthesis.speak(utterance)
      showToast('Reading note aloud...')
    } else {
      showToast('Speech synthesis not supported in this browser.')
    }
  }

  const currentNodes = datasetNodes[activeDatasetKey] || {}
  const currentNode = currentNodes[selectedTopic] || { m: null }
  const prereqList = activeDataset.prerequisites[selectedTopic] || []
  const weakPrereq = prereqList.find(
    (p) => currentNodes[p]?.m !== null && currentNodes[p]?.m < 0.5
  )

  return (
    <div className="relative animate-fade-in max-w-[1100px] mx-auto space-y-6 pb-20">
      <StarfieldSky />

      {/* ─── TOP SUBJECT SELECTOR & HUD ─── */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-3 bg-[var(--s1)] border border-[var(--bd)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase font-mono text-[var(--ac)]">
            Subject:
          </span>
          <div className="tabs flex gap-1.5">
            {[
              { key: 'ai',     label: 'AI & Machine Learning', code: '12-AI' },
              { key: 'python', label: 'Python Foundations',    code: '9-A' },
              { key: 'java',   label: 'Java Programming',      code: '10-B' },
              { key: 'iot',    label: 'IoT & Sensors',         code: '11-A' },
            ].map((ds) => (
              <button
                key={ds.key}
                type="button"
                aria-pressed={activeDatasetKey === ds.key}
                onClick={() => handleDatasetChange(ds.key)}
                className="text-xs py-1.5 px-3 min-h-[38px] font-semibold"
              >
                {ds.label} <span className="opacity-75 font-mono text-[10px]">· {ds.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Chips */}
        <div className="hud flex items-center gap-2">
          <span className="chip" title="Total XP Earned">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Points <span className="pts font-mono">{earnedXP} XP</span>
          </span>
          <span className="chip" title="Daily study streak">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            Streak: <b className="font-mono">{streakDays} days</b>
          </span>
          <span className="chip hidden sm:inline-flex">
            {activeDataset.fullTitle}
          </span>
        </div>
      </div>

      {/* ─── PORTAL NAVIGATION TABS ─── */}
      <div className="tabs flex gap-2 border-b border-[var(--bd)] pb-2" role="tablist">
        <button
          type="button"
          aria-pressed={activePortalTab === 'lessons'}
          onClick={() => setActivePortalTab('lessons')}
          className="text-sm font-semibold flex items-center gap-2 min-h-[44px]"
        >
          <BookOpen className="w-4 h-4" />
          <span>Lesson Plan & What to Read</span>
        </button>
        <button
          type="button"
          aria-pressed={activePortalTab === 'graph'}
          onClick={() => setActivePortalTab('graph')}
          className="text-sm font-semibold flex items-center gap-2 min-h-[44px]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Knowledge Constellation Graph</span>
        </button>
        <button
          type="button"
          aria-pressed={activePortalTab === 'compiler'}
          onClick={() => setActivePortalTab('compiler')}
          className="text-sm font-semibold flex items-center gap-2 min-h-[44px]"
        >
          <Code2 className="w-4 h-4" />
          <span>Interactive Code Compiler</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 1: LESSON PLAN & WHAT TO READ (STEP-BY-STEP IN EACH UNIT)
          ═══════════════════════════════════════════════════════════════════ */}
      {activePortalTab === 'lessons' && (
        <div className="space-y-6 animate-fade-in">
          {/* Unit Selector Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {activeDataset.units.map((unit, idx) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => {
                  setSelectedUnitIndex(idx)
                  setShowAllPages(false)
                  setSelectedQuizAnswer(null)
                  setQuizSubmitted(false)
                }}
                className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[42px] transition-all ${
                  idx === selectedUnitIndex && !showAllPages
                    ? 'bg-cyan-400 text-[#05070D] font-bold shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                    : 'bg-[var(--s1)] border border-[var(--bd)] text-[var(--tx)] hover:border-cyan-400'
                }`}
              >
                {unit.title}
              </button>
            ))}

            {/* All Pages Simultaneously Toggle Button */}
            <button
              type="button"
              id="all-pages-simultaneous-strip-btn"
              onClick={() => setShowAllPages(!showAllPages)}
              className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[42px] flex items-center gap-2 transition-all ${
                showAllPages
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                  : 'bg-[var(--s1)] border border-purple-500/30 text-purple-300 hover:border-purple-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Pages Simultaneously</span>
              <span className="badge text-[9px] bg-white/20 text-white px-1.5 py-0.2 font-mono">
                {activeDataset.units.length}
              </span>
            </button>
          </div>

          {/* Unit Step-by-Step Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Step 1 Reading & Step 4 Compiler Challenge */}
            <div className="lg:col-span-2 space-y-6">
              {/* STEP 1: WHAT TO READ (ORIGINAL PDF & AI-SIMPLIFIED DUAL VIEWER) */}
              <NotesPdfViewer
                unit={currentUnit}
                dataset={activeDataset}
                showAllSimultaneously={showAllPages}
                onToggleSimultaneous={(val) => setShowAllPages(val)}
                onSelectUnit={(idx) => {
                  setSelectedUnitIndex(idx)
                  setShowAllPages(false)
                }}
                onRewardXP={(xp, reason) => addXP(xp, reason)}
                onAskAI={(question) => {
                  setAiPrompt(question)
                  setAiAssistantOpen(true)
                }}
              />

              {/* STEP 4: INTERACTIVE CODE COMPILER CHALLENGE */}
              <InteractiveCompiler
                title={currentUnit.compilerChallenge.title}
                description={currentUnit.compilerChallenge.description}
                language={activeDataset.compilerLang}
                initialCode={currentUnit.compilerChallenge.initialCode}
                expectedOutput={currentUnit.compilerChallenge.expectedOutput}
                onRewardXP={(xp, reason) => addXP(xp, reason)}
                onAskAI={(codeQuery) => {
                  setAiPrompt(codeQuery)
                  setAiAssistantOpen(true)
                }}
              />
            </div>

            {/* Right Column: Step 2 Quiz & Step 3 Leveled Games */}
            <div className="space-y-6">
              {/* STEP 2: RECALL QUIZ WITH REWARDS */}
              <section className="card space-y-4 border border-amber-400/20">
                <div className="flex items-center justify-between">
                  <span className="chip text-[10px] text-amber-400 border-amber-400/30">
                    Step 2: Recall Quiz
                  </span>
                  <span className="badge text-[10px] bg-amber-500/10 text-amber-300 border-amber-400/30">
                    +{currentUnit.quiz.rewardXP} XP Reward
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[var(--tx)]">
                  {currentUnit.quiz.question}
                </h3>

                <div className="space-y-2">
                  {currentUnit.quiz.options.map((option, idx) => {
                    const isSelected = selectedQuizAnswer === idx
                    const isCorrect = idx === currentUnit.quiz.correctIndex
                    let btnStyle = 'bg-[var(--s2)] border-[var(--bd)] text-[var(--tx)] hover:border-cyan-400'

                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300'
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={quizSubmitted}
                        onClick={() => handleAnswerQuiz(idx)}
                        className={`w-full p-3 rounded-xl border text-xs text-left transition-all min-h-[44px] flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {quizSubmitted && (
                  <div className="p-3 rounded-xl bg-[var(--s2)] border border-[var(--bd)] text-xs text-[var(--tx)] space-y-1 animate-fade-in">
                    <div className="font-bold text-cyan-400">Explanation:</div>
                    <p className="mu">{currentUnit.quiz.explanation}</p>
                  </div>
                )}
              </section>

              {/* STEP 3: HANDS-ON LEVELED GAMES */}
              <section className="card space-y-4">
                <div className="flex items-center justify-between">
                  <span className="badge text-[10px]">Step 3: Leveled Games</span>
                  <span className="mu text-xs">Hands-on practice</span>
                </div>

                {/* Level Picker (1, 2, 3) */}
                <div className="grid grid-cols-3 gap-2">
                  {currentUnit.leveledGames.map((lvl) => {
                    const isCompleted = completedLevels[`${activeDatasetKey}:${currentUnit.id}:${lvl.level}`]
                    const isActive = activeGameLevel === lvl.level

                    return (
                      <button
                        key={lvl.level}
                        type="button"
                        onClick={() => setActiveGameLevel(lvl.level)}
                        className={`p-2 rounded-xl text-center border text-xs font-semibold min-h-[44px] transition-all ${
                          isActive
                            ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                            : 'bg-[var(--s2)] border-[var(--bd)] text-[var(--tx)] hover:border-cyan-400'
                        }`}
                      >
                        <div>Level {lvl.level}</div>
                        <div className="text-[10px] font-mono text-amber-400">+{lvl.xp} XP</div>
                      </button>
                    )
                  })}
                </div>

                {/* Active Level Card */}
                {(() => {
                  const currentLvl = currentUnit.leveledGames.find((l) => l.level === activeGameLevel) || currentUnit.leveledGames[0]
                  const isCompleted = completedLevels[`${activeDatasetKey}:${currentUnit.id}:${currentLvl.level}`]

                  return (
                    <div className="p-4 rounded-xl bg-[var(--s2)] border border-[var(--bd)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--tx)]">{currentLvl.levelName}</span>
                        <span className="chip text-[10px] text-amber-400 border-amber-400/30">+{currentLvl.xp} XP</span>
                      </div>

                      <p className="mu text-xs leading-relaxed">{currentLvl.task}</p>

                      <pre className="p-3 rounded-lg bg-[#05070D] border border-[var(--bd)] font-mono text-xs text-cyan-300 overflow-x-auto">
                        {currentLvl.code}
                      </pre>

                      {!isCompleted ? (
                        <button
                          type="button"
                          onClick={() => handleCompleteLevel(currentLvl)}
                          className="w-full py-2.5 px-3 rounded-xl bg-cyan-400 text-[#05070D] font-bold text-xs hover:bg-cyan-300 transition-all min-h-[40px] flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Complete Level & Claim XP</span>
                        </button>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Level Mastered! XP Claimed</span>
                        </div>
                      )}
                    </div>
                  )
                })()}

                <button
                  type="button"
                  onClick={() => {
                    setAiPrompt(`I need a hint for ${currentUnit.title} Level ${activeGameLevel}. How do I solve this?`)
                    setAiAssistantOpen(true)
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[var(--s2)] border border-[var(--bd)] text-xs text-cyan-300 hover:border-cyan-400 transition-all flex items-center justify-center gap-1.5 min-h-[38px]"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI Tutor for a Level Hint</span>
                </button>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 2: KNOWLEDGE CONSTELLATION GRAPH
          ═══════════════════════════════════════════════════════════════════ */}
      {activePortalTab === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
          {/* Left: SVG Knowledge Map */}
          <section className="card lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold font-display text-[var(--tx)]">
                My Universe · {activeDataset.name}
              </h1>
              <span className="badge">{activeDataset.category}</span>
            </div>
            <p className="mu text-sm leading-relaxed">
              Each star is a concept. Brighter means stronger. A dashed line marks a weak link;
              a hollow star means no data yet.
            </p>

            <KnowledgeMap
              nodes={currentNodes}
              links={activeDataset.links}
              selected={selectedTopic}
              unlocked={unlockedTopics}
              onSelectNode={(k) => setSelectedTopic(k)}
            />
          </section>

          {/* Right: Topic Diagnostic Panel */}
          <aside className="card lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-bold font-display text-[var(--tx)]">{cap(selectedTopic)}</h2>
              <p className="mu text-sm mt-0.5">
                Mastery: <b className="text-[var(--tx)] font-mono">{pc(currentNode.m)}</b>
              </p>
              {currentNode.desc && (
                <p className="mu text-xs mt-1 leading-normal italic">{currentNode.desc}</p>
              )}
            </div>

            {currentNode.m !== null && currentNode.m < 0.5 && weakPrereq && (
              <div className="why">
                <b>Why is this dim?</b>
                <br />
                {activeDataset.prereqDiagnostics[selectedTopic] || (
                  <>{cap(weakPrereq)} ({pc(currentNodes[weakPrereq]?.m)}) is still shaky, which makes {cap(selectedTopic)} harder. Revisit {cap(weakPrereq)} first.</>
                )}
              </div>
            )}

            {currentNode.m === null && (
              <div className="why">
                <b>No data yet.</b> Complete the recall check or practice games to light this star.
              </div>
            )}

            <div className="pt-2 border-t border-[var(--bd)] space-y-3">
              <button
                type="button"
                onClick={() => {
                  setAiPrompt(`Why is my mastery in ${selectedTopic} dim and how do I improve it?`)
                  setAiAssistantOpen(true)
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-semibold text-xs hover:bg-cyan-500/25 transition-all flex items-center justify-center gap-1.5 min-h-[42px]"
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI Tutor for Concept Diagnosis</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePortalTab('lessons')}
                className="w-full py-2 px-3 rounded-xl bg-[var(--s2)] border border-[var(--bd)] text-xs text-[var(--tx)] hover:border-cyan-400 transition-all flex items-center justify-center gap-1.5 min-h-[38px]"
              >
                <span>Go to Lesson Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 3: INTERACTIVE CODE COMPILER & RUNNER
          ═══════════════════════════════════════════════════════════════════ */}
      {activePortalTab === 'compiler' && (
        <div className="space-y-6 animate-fade-in">
          <InteractiveCompiler
            title={`Full Interactive Compiler: ${activeDataset.name}`}
            description="Run custom programs, test algorithms, and observe stdout execution in real-time."
            language={activeDataset.compilerLang}
            initialCode={currentUnit.compilerChallenge.initialCode}
            expectedOutput={currentUnit.compilerChallenge.expectedOutput}
            onRewardXP={(xp, reason) => addXP(xp, reason)}
            onAskAI={(codeQuery) => {
              setAiPrompt(codeQuery)
              setAiAssistantOpen(true)
            }}
          />
        </div>
      )}

      {/* ─── FLOATING CLAUDE AGENT BUTTON ─── */}
      <button
        type="button"
        id="student-ai-trigger"
        onClick={() => setAiAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 py-2.5 px-4 rounded-full bg-[#D97757] text-[#141312] font-serif font-bold text-xs shadow-[0_0_25px_rgba(217,119,87,0.45)] hover:scale-105 transition-all flex items-center gap-2 min-h-[44px] border border-[#FAF7F2]/20"
      >
        <Sparkles className="w-4 h-4 text-[#141312]" />
        <span>Ask Claude Agent</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* ─── IN-BUILT CLAUDE AGENT STUDIO ─── */}
      <StudentAiAssistant
        activeUnitTitle={currentUnit.title}
        activeTopic={currentUnit.topicKey || currentUnit.title}
        isOpen={aiAssistantOpen}
        initialPrompt={aiPrompt}
        onClose={() => {
          setAiAssistantOpen(false)
          setAiPrompt('')
        }}
      />

      {/* Floating Bottom Toast */}
      {toastVisible && (
        <div id="toast" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
