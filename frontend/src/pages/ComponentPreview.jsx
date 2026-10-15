import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import StarfieldSky from '../components/StarfieldSky'
import KnowledgeMap from '../components/KnowledgeMap'
import ClassObservatory from '../components/ClassObservatory'
import InteractiveCompiler from '../components/InteractiveCompiler'
import StudentAiAssistant from '../components/StudentAiAssistant'
import NotesPdfViewer from '../components/NotesPdfViewer'
import MasteryStar from '../components/MasteryStar'
import Button from '../components/Button'
import Card from '../components/Card'
import Tabs from '../components/Tabs'
import Dialog from '../components/Dialog'
import Drawer from '../components/Drawer'
import { CURRICULUM_DATASETS } from '../data/curriculumDatasets'
import { useAccessibilityStore } from '../store/accessibilityStore'
import {
  BookOpen, Sparkles, Code2, Play, CheckCircle2,
  Lock, ArrowRight, Bot, Zap, Flame, Award, Volume2,
  GraduationCap, Telescope, Compass, LineChart, Key
} from 'lucide-react'

const cap = (t) => t ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''
const pc = (m) => m === null || m === undefined ? 'No data' : `${Math.round(m * 100)}%`

export default function ComponentPreview() {
  const { theme, setTheme, openDrawer } = useAccessibilityStore()

  // Primary view mode ('s' = Student "My Universe", 't' = Teacher "Class Observatory", 'tokens' = Design Tokens)
  const [activeView, setActiveView] = useState('s')
  
  // Selected Curriculum Dataset ('python' | 'java' | 'iot')
  const [activeDatasetKey, setActiveDatasetKey] = useState('python')
  const activeDataset = CURRICULUM_DATASETS[activeDatasetKey] || CURRICULUM_DATASETS.python

  // Student portal sub-tab ('lessons' | 'graph' | 'compiler')
  const [studentSubTab, setStudentSubTab] = useState('lessons')

  // Selected Unit inside lesson plan
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0)
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [activeGameLevel, setActiveGameLevel] = useState(1)
  const [completedLevels, setCompletedLevels] = useState({})
  const [earnedXP, setEarnedXP] = useState(240)

  // AI Assistant state
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // Knowledge Map nodes state
  const [datasetNodes, setDatasetNodes] = useState({
    python: { ...CURRICULUM_DATASETS.python.nodes },
    java:   { ...CURRICULUM_DATASETS.java.nodes },
    iot:    { ...CURRICULUM_DATASETS.iot.nodes },
  })
  const [selectedTopics, setSelectedTopics] = useState({
    python: 'loops',
    java: 'inheritance',
    iot: 'telemetry',
  })
  const [unlockedTopics, setUnlockedTopics] = useState({})

  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [subTab, setSubTab] = useState('mastery')

  // Sample Credentials Modal
  const [credsModalOpen, setCredsModalOpen] = useState(false)

  const showToastNotification = (msg) => {
    setToastMessage(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2600)
  }

  const addXP = (amount, reason) => {
    setEarnedXP((prev) => prev + amount)
    showToastNotification(`+${amount} XP Earned! ${reason}`)
  }

  const isDark = theme === 'dark' || (theme === 'system' && (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true))

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    showToastNotification(`Switched to ${nextTheme === 'light' ? 'Aerospace Light' : 'Universe Dark'} theme`)
  }

  const currentUnit = activeDataset.units[selectedUnitIndex] || activeDataset.units[0]
  const currentTopicKey = selectedTopics[activeDatasetKey]
  const currentNodes = datasetNodes[activeDatasetKey] || {}
  const currentNode = currentNodes[currentTopicKey] || { m: null }

  const prereqList = activeDataset.prerequisites[currentTopicKey] || []
  const weakPrereq = prereqList.find(
    (p) => currentNodes[p]?.m !== null && currentNodes[p]?.m < 0.5
  )

  const handleAnswerQuiz = (index) => {
    if (quizSubmitted) return
    setSelectedQuizAnswer(index)
    setQuizSubmitted(true)

    if (index === currentUnit.quiz.correctIndex) {
      addXP(currentUnit.quiz.rewardXP, 'Quiz passed on first attempt!')
      setUnlockedTopics((prev) => ({
        ...prev,
        [`${activeDatasetKey}:${currentUnit.topicKey}`]: true,
      }))
    } else {
      showToastNotification('Review the lesson note and try again.')
    }
  }

  const handleCompleteLevel = (lvl) => {
    setCompletedLevels((prev) => ({
      ...prev,
      [`${activeDatasetKey}:${currentUnit.id}:${lvl.level}`]: true,
    }))
    addXP(lvl.xp, `${lvl.levelName} Mastered!`)
  }

  const isTopicUnlocked = Boolean(unlockedTopics[`${activeDatasetKey}:${currentTopicKey}`])

  return (
    <div className="min-h-screen text-[var(--tx)] relative selection:bg-[rgba(34,211,238,0.2)] selection:text-cyan-300 pb-20">
      {/* ─── Fixed Twinkling Canvas Starfield ─── */}
      <StarfieldSky />

      {/* Main Container */}
      <div className="app relative z-10 max-w-[1100px] mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Bar */}
        <header className="flex flex-wrap gap-3 items-center justify-between mb-4 pb-4 border-b border-[var(--bd)]">
          <div className="flex items-center gap-3">
            <Link to="/login" className="brand flex items-center gap-1.5 text-2xl font-bold font-display group">
              Learn<i className="text-[var(--ac)] not-italic">AI</i>
            </Link>
            <span className="badge hidden sm:inline-flex text-xs">Learning Universe</span>
          </div>

          {/* View Toggles */}
          <div className="tabs flex gap-1.5" role="group" aria-label="Choose universe view">
            <button
              type="button"
              data-v="s"
              aria-pressed={activeView === 's'}
              onClick={() => setActiveView('s')}
              className="text-sm font-semibold"
            >
              Student Portal
            </button>
            <button
              type="button"
              data-v="t"
              aria-pressed={activeView === 't'}
              onClick={() => setActiveView('t')}
              className="text-sm font-semibold"
            >
              Teacher Observatory
            </button>
            <button
              type="button"
              data-v="tokens"
              aria-pressed={activeView === 'tokens'}
              onClick={() => setActiveView('tokens')}
              className="text-sm font-semibold"
            >
              Tokens & System
            </button>
          </div>

          {/* Theme, Passwords & Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCredsModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-400/30 rounded-xl hover:border-amber-400 flex items-center gap-1 min-h-[38px]"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Sample Logins</span>
            </button>
            <button
              id="th"
              type="button"
              onClick={toggleTheme}
              className="text-xs font-semibold min-h-[38px]"
              title="Toggle universe theme"
            >
              {isDark ? 'Switch light' : 'Switch dark'}
            </button>
            <button
              type="button"
              onClick={openDrawer}
              className="text-xs font-semibold min-h-[38px]"
              title="Open Accessibility settings"
            >
              A11y
            </button>
          </div>
        </header>

        {/* ─── 1. STUDENT VIEW: "MY UNIVERSE" ─── */}
        {activeView === 's' && (
          <main id="m" className="space-y-6 animate-fade-in">
            {/* Subject Selector Bar */}
            <div className="card p-3 flex flex-wrap items-center justify-between gap-3 bg-[var(--s1)] border border-[var(--bd)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase font-mono text-[var(--ac)]">
                  Subject Universe:
                </span>
                <div className="tabs flex gap-1.5">
                  {[
                    { key: 'python', label: 'Python Foundations', code: '9-A' },
                    { key: 'java',   label: 'Java Programming',   code: '10-B' },
                    { key: 'iot',    label: 'IoT & Sensors',      code: '11-A' },
                  ].map((ds) => (
                    <button
                      key={ds.key}
                      type="button"
                      aria-pressed={activeDatasetKey === ds.key}
                      onClick={() => {
                        setActiveDatasetKey(ds.key)
                        setSelectedUnitIndex(0)
                        setSelectedQuizAnswer(null)
                        setQuizSubmitted(false)
                        showToastNotification(`Loaded ${ds.label} universe`)
                      }}
                      className="text-xs py-1.5 px-3 min-h-[38px] font-semibold"
                    >
                      {ds.label} <span className="opacity-70 font-mono text-[10px]">· {ds.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* HUD Telemetry Chips */}
              <div className="hud flex items-center gap-2">
                <span className="chip" title="Total XP Earned">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Points <span className="pts font-mono">{earnedXP} XP</span>
                </span>
                <span className="chip">
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                  Streak: <b>3 days</b>
                </span>
                <span className="chip hidden sm:inline-flex">{activeDataset.fullTitle}</span>
              </div>
            </div>

            {/* Student Portal Sub-Tabs */}
            <div className="tabs flex gap-2 border-b border-[var(--bd)] pb-2">
              <button
                type="button"
                aria-pressed={studentSubTab === 'lessons'}
                onClick={() => setStudentSubTab('lessons')}
                className="text-sm font-semibold flex items-center gap-2 min-h-[44px]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Lesson Plan & What to Read</span>
              </button>
              <button
                type="button"
                aria-pressed={studentSubTab === 'graph'}
                onClick={() => setStudentSubTab('graph')}
                className="text-sm font-semibold flex items-center gap-2 min-h-[44px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Knowledge Constellation Graph</span>
              </button>
              <button
                type="button"
                aria-pressed={studentSubTab === 'compiler'}
                onClick={() => setStudentSubTab('compiler')}
                className="text-sm font-semibold flex items-center gap-2 min-h-[44px]"
              >
                <Code2 className="w-4 h-4" />
                <span>Interactive Code Compiler</span>
              </button>
            </div>

            {/* SUB-VIEW 1: LESSON PLAN & WHAT TO READ */}
            {studentSubTab === 'lessons' && (
              <div className="space-y-6 animate-fade-in">
                {/* Unit Selector Strip */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {activeDataset.units.map((unit, idx) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnitIndex(idx)
                        setSelectedQuizAnswer(null)
                        setQuizSubmitted(false)
                      }}
                      className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[42px] transition-all ${
                        idx === selectedUnitIndex
                          ? 'bg-cyan-400 text-[#05070D] font-bold shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                          : 'bg-[var(--s1)] border border-[var(--bd)] text-[var(--tx)] hover:border-cyan-400'
                      }`}
                    >
                      {unit.title}
                    </button>
                  ))}
                </div>

                {/* Grid: Reading + Compiler on left, Quiz + Leveled Games on right */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Step 1: What to Read (Original PDF & AI-Simplified Dual Viewer) */}
                    <NotesPdfViewer
                      unit={currentUnit}
                      dataset={activeDataset}
                      onAskAI={(codeQuery) => {
                        setAiPrompt(codeQuery)
                        setAiAssistantOpen(true)
                      }}
                    />

                    {/* Step 4: Compiler Challenge */}
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
                    {/* Step 2: Recall Quiz */}
                    <section className="card space-y-4 border border-amber-400/20">
                      <div className="flex items-center justify-between">
                        <span className="chip text-[10px] text-amber-400 border-amber-400/30">
                          Step 2: Recall Quiz
                        </span>
                        <span className="badge text-[10px] bg-amber-500/10 text-amber-300 border-amber-400/30">
                          +{currentUnit.quiz.rewardXP} XP Reward
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[var(--tx)]">{currentUnit.quiz.question}</h3>

                      <div className="space-y-2">
                        {currentUnit.quiz.options.map((option, idx) => {
                          const isSelected = selectedQuizAnswer === idx
                          const isCorrect = idx === currentUnit.quiz.correctIndex
                          let btnStyle = 'bg-[var(--s2)] border-[var(--bd)] text-[var(--tx)] hover:border-cyan-400'

                          if (quizSubmitted) {
                            if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            else if (isSelected && !isCorrect) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300'
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
                              {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
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

                    {/* Step 3: Leveled Games */}
                    <section className="card space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="badge text-[10px]">Step 3: Leveled Games</span>
                        <span className="mu text-xs">Hands-on Practice</span>
                      </div>

                      {/* Level Picker (1, 2, 3) */}
                      <div className="grid grid-cols-3 gap-2">
                        {currentUnit.leveledGames.map((lvl) => {
                          const isActive = activeGameLevel === lvl.level
                          return (
                            <button
                              key={lvl.level}
                              type="button"
                              onClick={() => setActiveGameLevel(lvl.level)}
                              className={`p-2 rounded-xl text-center border text-xs font-semibold min-h-[44px] transition-all ${
                                isActive
                                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
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

            {/* SUB-VIEW 2: KNOWLEDGE CONSTELLATION GRAPH */}
            {studentSubTab === 'graph' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
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
                    selected={currentTopicKey}
                    unlocked={{ [currentTopicKey]: isTopicUnlocked }}
                    onSelectNode={(k) =>
                      setSelectedTopics((prev) => ({
                        ...prev,
                        [activeDatasetKey]: k,
                      }))
                    }
                  />
                </section>

                <aside className="card lg:col-span-2 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold font-display text-[var(--tx)]">{cap(currentTopicKey)}</h2>
                    <p className="mu text-sm mt-0.5">
                      Mastery: <b className="text-[var(--tx)] font-mono">{pc(currentNode.m)}</b>
                    </p>
                    {currentNode.desc && <p className="mu text-xs mt-1 leading-normal italic">{currentNode.desc}</p>}
                  </div>

                  {currentNode.m !== null && currentNode.m < 0.5 && weakPrereq && (
                    <div className="why">
                      <b>Why is this dim?</b>
                      <br />
                      {activeDataset.prereqDiagnostics[currentTopicKey] || (
                        <>{cap(weakPrereq)} ({pc(currentNodes[weakPrereq]?.m)}) is still shaky, which makes {cap(currentTopicKey)} harder. Revisit {cap(weakPrereq)} first.</>
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
                        setAiPrompt(`Why is my mastery in ${currentTopicKey} dim and how do I improve it?`)
                        setAiAssistantOpen(true)
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-semibold text-xs hover:bg-cyan-500/25 transition-all flex items-center justify-center gap-1.5 min-h-[42px]"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Ask AI Tutor for Concept Diagnosis</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentSubTab('lessons')}
                      className="w-full py-2 px-3 rounded-xl bg-[var(--s2)] border border-[var(--bd)] text-xs text-[var(--tx)] hover:border-cyan-400 transition-all flex items-center justify-center gap-1.5 min-h-[38px]"
                    >
                      <span>Go to Lesson Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {/* SUB-VIEW 3: INTERACTIVE CODE COMPILER */}
            {studentSubTab === 'compiler' && (
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

            {/* In-built AI Tutor Floating Trigger */}
            <button
              type="button"
              onClick={() => setAiAssistantOpen(true)}
              className="fixed bottom-6 right-6 z-40 py-2.5 px-4 rounded-full bg-cyan-400 text-[#05070D] font-bold text-xs shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:scale-105 transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Tutor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </button>

            {/* In-built AI Tutor Panel */}
            <StudentAiAssistant
              activeUnitTitle={currentUnit.title}
              activeTopic={currentUnit.whatToRead.overview}
              isOpen={aiAssistantOpen}
              initialPrompt={aiPrompt}
              onClose={() => {
                setAiAssistantOpen(false)
                setAiPrompt('')
              }}
            />
          </main>
        )}

        {/* ─── 2. TEACHER VIEW: "CLASS OBSERVATORY" ─── */}
        {activeView === 't' && (
          <main id="m" className="space-y-6 animate-fade-in">
            <ClassObservatory onToast={showToastNotification} />
          </main>
        )}

        {/* ─── 3. TOKENS & SYSTEM SHOWCASE ─── */}
        {activeView === 'tokens' && (
          <main className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--bd)]">
              <div>
                <h1 className="text-2xl font-bold font-display text-[var(--tx)]">
                  Design Tokens & Curriculum Datasets
                </h1>
                <p className="mu text-xs mt-1">
                  Active datasets: Python Foundations, Java Programming & Internet of Things (IoT).
                </p>
              </div>
            </div>

            <Tabs
              tabs={[
                { id: 'mastery', label: '1. MasteryStar Scale' },
                { id: 'datasets', label: '2. Datasets Overview' },
                { id: 'palette', label: '3. Palette & Swatches' },
                { id: 'buttons', label: '4. Base Buttons' },
              ]}
              activeTab={subTab}
              onChange={setSubTab}
            />

            {subTab === 'mastery' && (
              <div className="space-y-6">
                <Card>
                  <h3 className="text-sm font-bold font-display text-[var(--tx)] mb-4">Mastery Progression Matrix</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-[var(--s2)] border border-[var(--bd)] flex flex-col items-center">
                      <span className="mu text-xs mb-2">1. No Data</span>
                      <MasteryStar score={null} size="lg" label="Lists" />
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--s2)] border border-[var(--bd)] flex flex-col items-center">
                      <span className="text-indigo-400 text-xs mb-2">2. Dim Indigo (35%)</span>
                      <MasteryStar score={35} size="lg" label="Variables" />
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--s2)] border border-[var(--bd)] flex flex-col items-center">
                      <span className="text-cyan-400 text-xs mb-2">3. Teal (70%)</span>
                      <MasteryStar score={70} size="lg" label="Conditionals" />
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--s2)] border border-[var(--bd)] flex flex-col items-center">
                      <span className="text-white text-xs mb-2">4. White-Cyan (95%)</span>
                      <MasteryStar score={95} size="lg" label="Loops" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {subTab === 'datasets' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(CURRICULUM_DATASETS).map((ds) => (
                  <Card key={ds.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="badge text-[10px]">{ds.category}</span>
                      <span className="font-mono text-xs text-[var(--ac)]">{ds.code}</span>
                    </div>
                    <h3 className="text-base font-bold font-display text-[var(--tx)]">{ds.name}</h3>
                    <p className="mu text-xs">{ds.tagline}</p>
                    <div className="pt-2 border-t border-[var(--bd)] space-y-1">
                      <div className="text-[11px] font-semibold text-[var(--tx)]">Key Topics:</div>
                      <div className="flex flex-wrap gap-1">
                        {ds.topics.map((t) => (
                          <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--s2)] border border-[var(--bd)]">
                            {cap(t)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {subTab === 'palette' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { name: '--bg', hex: '#05070D', desc: 'Universe background' },
                  { name: '--s1', hex: '#0B1020', desc: 'Surface layer 1' },
                  { name: '--s2', hex: '#121933', desc: 'Surface layer 2' },
                  { name: '--ac', hex: '#22D3EE', desc: 'Teal-cyan accent' },
                  { name: '--am', hex: '#F59E0B', desc: 'Amber points & streaks' },
                  { name: '--co', hex: '#FB7185', desc: 'Soft coral support' },
                ].map((c) => (
                  <div key={c.name} className="p-3 rounded-xl bg-[var(--s1)] border border-[var(--bd)]">
                    <div
                      className="w-full h-12 rounded-lg mb-2 border border-white/10 flex items-center justify-center font-mono text-xs font-bold"
                      style={{ backgroundColor: c.hex, color: ['--bg', '--s1', '--s2'].includes(c.name) ? '#fff' : '#05070D' }}
                    >
                      {c.hex}
                    </div>
                    <div className="font-mono text-xs font-bold text-[var(--tx)]">{c.name}</div>
                    <div className="mu text-[11px] truncate">{c.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {subTab === 'buttons' && (
              <Card className="space-y-4">
                <h3 className="text-base font-bold font-display text-[var(--tx)]">Base Button Variants (44px min touch target)</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="warm">Warm Amber (Points)</Button>
                  <Button variant="danger">Support Coral</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                </div>
              </Card>
            )}
          </main>
        )}
      </div>

      {/* Floating Bottom Toast */}
      {toastVisible && (
        <div id="toast" role="status">
          {toastMessage}
        </div>
      )}

      {/* Sample Logins Dialog */}
      <Dialog
        open={credsModalOpen}
        onClose={() => setCredsModalOpen(false)}
        title="Sample Login Credentials"
        description="Pre-configured sample accounts for teacher and student portals."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--s2)] border border-cyan-400/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="badge text-[10px]">Teacher Portal</span>
              <Telescope className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-sm font-bold text-[var(--tx)]">Class Observatory Director (Ms. Rivera)</div>
            <div className="p-2.5 rounded-lg bg-[var(--s1)] font-mono text-xs text-[var(--tx)] flex justify-between">
              <span>ID: <b className="text-cyan-400">T-001</b></span>
              <span>Password: <b className="text-cyan-400">teach123</b></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--s2)] border border-amber-400/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="chip text-[10px] text-amber-400 border-amber-400/30">Student Portal</span>
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-bold text-[var(--tx)]">Cadet Explorer (Alex)</div>
            <div className="p-2.5 rounded-lg bg-[var(--s1)] font-mono text-xs text-[var(--tx)] flex justify-between">
              <span>ID: <b className="text-amber-400">S-001</b></span>
              <span>Password: <b className="text-amber-400">student123</b></span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              to="/login"
              className="py-2.5 px-4 rounded-xl bg-cyan-400 text-[#05070D] font-bold text-xs flex items-center gap-1.5"
            >
              <span>Go to Login Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
