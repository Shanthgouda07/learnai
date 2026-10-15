import React, { useState } from 'react'
import { CURRICULUM_DATASETS } from '../data/curriculumDatasets'
import TeacherAiAssistant from './TeacherAiAssistant'
import LectureNotesImporterModal from './LectureNotesImporterModal'
import RemedialGameCreatorModal from './RemedialGameCreatorModal'
import {
  TrendingUp, Users, Brain, Shield, AlertTriangle,
  Sparkles, CheckCircle2, ChevronRight, BarChart3, LineChart,
  Bot, Compass, Orbit, Activity, Check, X, ArrowUpRight,
  Eye, RefreshCw, Send, Layers, Radio, Lock, Upload,
  Award, Gamepad2, Trophy, Clock, FileText, Play, Bug
} from 'lucide-react'

export const CLASSES_LIST = [
  {
    key: 'ai',
    n: 'Artificial Intelligence · 12-AI',
    code: '24CSEN1011',
    subject: 'AI & Deep Learning',
    s: 18,
    a: 16,
    acc: 75,
    f: 3,
    sp: [65, 70, 68, 74, 72, 75],
    growthTrajectory: [
      { session: 'S1', avg: 64, s002: 78, s004: 35, s011: 30 },
      { session: 'S2', avg: 68, s002: 85, s004: 38, s011: 32 },
      { session: 'S3', avg: 71, s002: 90, s004: 30, s011: 25 },
      { session: 'S4', avg: 75, s002: 94, s004: 35, s011: 30 },
    ],
  },
  {
    key: 'python',
    n: 'Python Basics · 9-A',
    code: '24CSEN1002',
    subject: 'Python Foundations',
    s: 12,
    a: 9,
    acc: 62,
    f: 3,
    sp: [50, 55, 52, 60, 58, 62],
    growthTrajectory: [
      { session: 'S1', avg: 52, s002: 60, s004: 30, s011: 35 },
      { session: 'S2', avg: 56, s002: 72, s004: 32, s011: 30 },
      { session: 'S3', avg: 59, s002: 80, s004: 30, s011: 28 },
      { session: 'S4', avg: 62, s002: 85, s004: 35, s011: 33 },
    ],
  },
  {
    key: 'java',
    n: 'Java OOP · 10-B',
    code: '24CSEN1005',
    subject: 'Java Programming',
    s: 16,
    a: 14,
    acc: 68,
    f: 3,
    sp: [58, 62, 65, 60, 67, 68],
    growthTrajectory: [
      { session: 'S1', avg: 58, s002: 70, s004: 35, s011: 30 },
      { session: 'S2', avg: 62, s002: 80, s004: 38, s011: 32 },
      { session: 'S3', avg: 66, s002: 88, s004: 32, s011: 30 },
      { session: 'S4', avg: 68, s002: 92, s004: 35, s011: 32 },
    ],
  },
  {
    key: 'iot',
    n: 'IoT & Connected Sensors · 11-A',
    code: '24CSEN1009',
    subject: 'Internet of Things (IoT)',
    s: 14,
    a: 12,
    acc: 72,
    f: 3,
    sp: [62, 66, 64, 70, 69, 72],
    growthTrajectory: [
      { session: 'S1', avg: 62, s002: 75, s004: 32, s011: 28 },
      { session: 'S2', avg: 66, s002: 82, s004: 34, s011: 30 },
      { session: 'S3', avg: 69, s002: 88, s004: 30, s011: 28 },
      { session: 'S4', avg: 72, s002: 90, s004: 32, s011: 30 },
    ],
  },
]

const cap = (t) => t ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''

export default function ClassObservatory({ onToast }) {
  const [selectedClassIndex, setSelectedClassIndex] = useState(0)
  const [draftState, setDraftState] = useState(0) // 0: None, 1: Drafted, 2: Approved
  const [aiCoPilotOpen, setAiCoPilotOpen] = useState(false)
  const [selectedStudentForGraph, setSelectedStudentForGraph] = useState('s004')
  const [spatialHoverStudent, setSpatialHoverStudent] = useState(null)
  const [activeViewTab, setActiveViewTab] = useState('activity') // 'activity' | 'radar' | 'heatmap' | 'trajectory'

  // Modals state
  const [notesImporterOpen, setNotesImporterOpen] = useState(false)
  const [remedialModalOpen, setRemedialModalOpen] = useState(false)
  const [remedialTargetStudent, setRemedialTargetStudent] = useState(null)

  const activeClassMeta = CLASSES_LIST[selectedClassIndex]
  const activeDataset = CURRICULUM_DATASETS[activeClassMeta.key] || CURRICULUM_DATASETS.ai

  const report = activeDataset.flaggedReport || {
    flagsCount: 3,
    studentId: 'S-004',
    concept: 'Loops & Iterations',
    conceptScore: '30%',
    rootCause: 'Variables & Memory (35%)',
    peers: 'S-007 and S-011',
    taskTitle: 'Targeted Remedial Support Task',
  }

  const trajectory = activeClassMeta.growthTrajectory

  // Comprehensive Student Live Activity Roster (What are they doing, completion, toppers vs lagging)
  const studentActivityList = [
    {
      id: 'S-002',
      name: 'Alex Chen',
      regNo: '2024CS002',
      mastery: 95,
      accuracy: '95%',
      xp: 1450,
      currentAction: 'Implementing Neural Network Backpropagation in Compiler',
      lastActive: 'Active 2m ago',
      completionStatus: 'Completed',
      unitsCompleted: '6 of 6 Units',
      assignmentStatus: 'Approved (9.8/10)',
      isTopper: true,
      isLagging: false,
    },
    {
      id: 'S-009',
      name: 'Devin Vance',
      regNo: '2024CS009',
      mastery: 88,
      accuracy: '88%',
      xp: 1120,
      currentAction: 'Testing MQTT QoS Telemetry Router',
      lastActive: 'Active 8m ago',
      completionStatus: 'Completed',
      unitsCompleted: '5 of 6 Units',
      assignmentStatus: 'Approved (9.2/10)',
      isTopper: false,
      isLagging: false,
    },
    {
      id: 'S-014',
      name: 'Priya Sharma',
      regNo: '2024CS014',
      mastery: 72,
      accuracy: '72%',
      xp: 850,
      currentAction: 'Reviewing Interface Contracts & Diamond Problem',
      lastActive: 'Active 14m ago',
      completionStatus: 'In Progress',
      unitsCompleted: '4 of 6 Units',
      assignmentStatus: 'Submitted (Grading)',
      isTopper: false,
      isLagging: false,
    },
    {
      id: 'S-007',
      name: 'Liam Patel',
      regNo: '2024CS007',
      mastery: 45,
      accuracy: '45%',
      xp: 410,
      currentAction: 'Reading Conditionals Truth Value Testing',
      lastActive: 'Idle 25m ago',
      completionStatus: 'Lagging',
      unitsCompleted: '2 of 6 Units',
      assignmentStatus: 'Pending',
      isTopper: false,
      isLagging: true,
      bottleneck: 'Conditionals (40%)',
      rootCause: 'Variables & Truth Values',
    },
    {
      id: 'S-004',
      name: 'Casey Miller',
      regNo: '2024CS004',
      mastery: 32,
      accuracy: '32%',
      xp: 320,
      currentAction: 'Failed Loops Iteration Challenge (3 attempts)',
      lastActive: 'Active 3m ago',
      completionStatus: 'Lagging',
      unitsCompleted: '1 of 6 Units',
      assignmentStatus: 'Overdue (3 days)',
      isTopper: false,
      isLagging: true,
      bottleneck: 'Loops & Iterations (30%)',
      rootCause: 'Variables & Memory (35%)',
    },
    {
      id: 'S-011',
      name: 'Jordan Brooks',
      regNo: '2024CS011',
      mastery: 28,
      accuracy: '28%',
      xp: 290,
      currentAction: 'Stuck on Type Casting & Indentation Block',
      lastActive: 'Idle 1h ago',
      completionStatus: 'Lagging',
      unitsCompleted: '1 of 6 Units',
      assignmentStatus: 'Pending',
      isTopper: false,
      isLagging: true,
      bottleneck: 'State Invariants (28%)',
      rootCause: 'Dynamic Typing & References',
    },
  ]

  const classTopper = studentActivityList.find((s) => s.isTopper)
  const laggingStudents = studentActivityList.filter((s) => s.isLagging)

  // Spatial Coordinate Mapping for students in the Celestial Radar
  const spatialStudents = [
    { id: 'S-002', name: 'Cadet S-002 (Alex)', mastery: 95, velocity: 88, status: 'high', x: 75, y: 32, orbit: 1 },
    { id: 'S-004', name: 'Cadet S-004 (Casey)', mastery: 32, velocity: 28, status: 'flagged', x: 28, y: 72, orbit: 3, bottleneck: 'Variables Prerequisite (35%)' },
    { id: 'S-007', name: 'Cadet S-007 (Liam)', mastery: 38, velocity: 30, status: 'flagged', x: 34, y: 64, orbit: 3, bottleneck: 'Conditionals (40%)' },
    { id: 'S-009', name: 'Cadet S-009 (Devin)', mastery: 85, velocity: 80, status: 'high', x: 70, y: 40, orbit: 1 },
    { id: 'S-011', name: 'Cadet S-011 (Jordan)', mastery: 28, velocity: 24, status: 'flagged', x: 24, y: 78, orbit: 3, bottleneck: 'State Invariants (28%)' },
    { id: 'S-014', name: 'Cadet S-014 (Priya)', mastery: 64, velocity: 55, status: 'neutral', x: 54, y: 50, orbit: 2 },
  ]

  const openRemedialCreatorForStudent = (student) => {
    setRemedialTargetStudent({
      id: student.id,
      name: `${student.name} (${student.id})`,
      rootCause: student.rootCause || 'Foundational Prerequisite Gap',
      concept: student.bottleneck || 'Programming Logic',
    })
    setRemedialModalOpen(true)
  }

  const renderCell = (v) => {
    if (v === null || v === undefined) {
      return <div className="cell nd" aria-label="no data">–</div>
    }
    const isLowConfidence = Array.isArray(v)
    const rawVal = isLowConfidence ? v[0] : v
    const bgOpacity = 0.1 + 0.65 * rawVal

    return (
      <div
        className={`cell ${isLowConfidence ? 'low' : ''}`}
        style={{
          background: `rgba(34, 211, 238, ${bgOpacity})`,
          color: rawVal > 0.6 ? '#05070D' : '#EEF1F8',
        }}
      >
        {Math.round(rawVal * 100)}%{isLowConfidence ? '*' : ''}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── SPATIAL COMMAND BAR & ACADEMIC PORTAL HEADER ─── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007467]/30 to-cyan-500/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <Orbit className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-display text-white">
                  Teacher Spatial Command Deck & Student Observatory
                </h1>
                <span className="badge text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-mono">
                  Course: {activeClassMeta.code}
                </span>
                <span className="badge text-[10px] bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-mono">
                  Semester III
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time student activity tracking, work completion diagnostics, class toppers vs lagging students, and 1-click remedial game creation.
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setNotesImporterOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs flex items-center gap-2 min-h-[42px] transition-all"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Add Lecture Notes (Drive / Explorer)</span>
          </button>

          <button
            type="button"
            onClick={() => setAiCoPilotOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 flex items-center gap-2 min-h-[42px] transition-all"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Launch Claude Co-Pilot</span>
          </button>
        </div>
      </div>

      {/* ─── SPATIAL TELEMETRY HUD CAPSULES ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Class Accuracy Index</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">{activeClassMeta.acc}%</div>
          <div className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            +4.8% session velocity
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Lagging Students</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-display text-rose-300">{laggingStudents.length} Students</div>
          <div className="text-[11px] text-rose-400 font-mono">
            Needs remedial focus
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Autonomous AI Guard</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-300">100% Gated</div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Teacher approval mandatory
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Class Topper Score</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-300">95% (Alex S-002)</div>
          <div className="text-[11px] text-amber-400 font-mono">
            All 6 Units Mastered
          </div>
        </div>
      </div>

      {/* ─── CLASS SELECTOR CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CLASSES_LIST.map((cls, idx) => (
          <button
            key={cls.n}
            type="button"
            onClick={() => {
              setSelectedClassIndex(idx)
              setDraftState(0)
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              idx === selectedClassIndex
                ? 'bg-gradient-to-tr from-cyan-500/15 via-white/[0.06] to-transparent border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-xs text-white">{cls.n}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">
                {cls.code}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {cls.s} enrolled · {cls.a} active
            </div>
            <div className="text-xs font-semibold text-cyan-300 mt-1">
              Accuracy: {cls.acc}% · {cls.f} flags
            </div>
          </button>
        ))}
      </div>

      {/* ─── SPATIAL VIEW MODE TABS ─── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveViewTab('activity')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeViewTab === 'activity'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live Student Activity & Completion Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('radar')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeViewTab === 'radar'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>Spatial Celestial Radar (2.5D Orbit)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('heatmap')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeViewTab === 'heatmap'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Concept Mastery Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab('trajectory')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
            activeViewTab === 'trajectory'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>Accuracy Trajectory Curves</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ─── 1. LIVE STUDENT ACTIVITY & WORK COMPLETION MATRIX ─── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeViewTab === 'activity' && (
        <section className="space-y-4 animate-fade-in">
          {/* Spotlight Row: Class Topper vs Lagging Students Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class Topper Spotlight Card */}
            {classTopper && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#0D1526] to-emerald-500/10 border border-amber-500/35 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="badge text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono">
                        Class Topper
                      </span>
                      <h4 className="text-base font-bold font-display text-white mt-0.5">
                        {classTopper.name} ({classTopper.id})
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold font-display text-amber-300">{classTopper.accuracy}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Roll: {classTopper.regNo}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-300">
                  <b>Current Activity:</b> {classTopper.currentAction}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {classTopper.unitsCompleted} · {classTopper.assignmentStatus}
                  </span>
                  <span className="badge bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                    {classTopper.xp} XP Earned
                  </span>
                </div>
              </div>
            )}

            {/* Lagging Students Alert Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-[#0D1526] to-purple-500/10 border border-rose-500/35 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <span className="badge text-[10px] bg-rose-500/20 text-rose-300 border-rose-500/40 font-mono">
                      Attention Required ({laggingStudents.length} Students)
                    </span>
                    <h4 className="text-base font-bold font-display text-white mt-0.5">
                      Lagging Prerequisite Bottlenecks
                    </h4>
                  </div>
                </div>
                <span className="badge bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                  Actionable
                </span>
              </div>

              <div className="text-xs text-slate-300">
                Students <b>{laggingStudents.map(s => s.id).join(', ')}</b> have incomplete assignments and are struggling with foundational topics. Teacher can focus on any student below to generate a tailored interactive game.
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => openRemedialCreatorForStudent(laggingStudents[0])}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 hover:brightness-110 flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Create Remedial Game for {laggingStudents[0]?.id}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Complete Live Student Roster Table */}
          <div className="card p-6 bg-[#070A14]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold font-display text-white">
                  Class Roster: Live Student Activity & Work Completion
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {studentActivityList.length} Active Students Monitored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2.5 px-3">Student / Roll No</th>
                    <th className="py-2.5 px-3">Live Current Activity</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Units Completed</th>
                    <th className="py-2.5 px-3">Assignment Status</th>
                    <th className="py-2.5 px-3 text-right">Teacher Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {studentActivityList.map((st) => (
                    <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Roll */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            st.isTopper ? 'bg-amber-400' : st.isLagging ? 'bg-rose-400' : 'bg-cyan-400'
                          }`} />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {st.name}
                              {st.isTopper && <Trophy className="w-3 h-3 text-amber-400" />}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{st.id} · {st.regNo}</div>
                          </div>
                        </div>
                      </td>

                      {/* Current Action */}
                      <td className="py-3 px-3">
                        <div className="text-slate-200">{st.currentAction}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{st.lastActive}</div>
                      </td>

                      {/* Accuracy */}
                      <td className="py-3 px-3">
                        <span className={`font-mono font-bold ${
                          st.mastery >= 80 ? 'text-emerald-400' : st.mastery <= 40 ? 'text-rose-400' : 'text-cyan-400'
                        }`}>
                          {st.accuracy}
                        </span>
                      </td>

                      {/* Units Completed */}
                      <td className="py-3 px-3">
                        <span className="badge text-[11px] bg-white/5 text-slate-300 font-mono">
                          {st.unitsCompleted}
                        </span>
                      </td>

                      {/* Assignment Status */}
                      <td className="py-3 px-3">
                        <span className={`badge text-[10px] font-mono ${
                          st.assignmentStatus.includes('Approved')
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : st.assignmentStatus.includes('Overdue')
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          {st.assignmentStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right">
                        {st.isLagging ? (
                          <button
                            type="button"
                            onClick={() => openRemedialCreatorForStudent(st)}
                            className="py-1 px-3 rounded-lg text-[11px] font-bold bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 hover:brightness-110 flex items-center gap-1 ml-auto shadow-sm"
                          >
                            <Gamepad2 className="w-3 h-3" />
                            <span>Create Game</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentForGraph(st.id.toLowerCase().replace('-', ''))
                              setActiveViewTab('trajectory')
                            }}
                            className="py-1 px-2.5 rounded-lg text-[11px] font-semibold bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-400 ml-auto flex items-center gap-1"
                          >
                            <span>Inspect Trajectory</span>
                            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ─── 2. SPATIAL CELESTIAL RADAR (ORBITAL VIEW) ─── */}
      {activeViewTab === 'radar' && (
        <section className="card p-6 bg-[#070A14]/90 backdrop-blur-2xl border border-cyan-500/25 rounded-2xl shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Orbit className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold font-display text-white">
                Spatial Student Observatory Radar
              </h2>
              <span className="badge text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                {activeClassMeta.n}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Mastery Orbit (80%+)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Developing (50-80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                Bottleneck Flag (&lt;50%)
              </span>
            </div>
          </div>

          {/* 2.5D Spatial Field */}
          <div className="relative w-full h-80 rounded-2xl bg-gradient-to-b from-[#090E1E] to-[#04060C] border border-white/10 overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.12)_0%,_transparent_70%)] pointer-events-none" />
            <div className="absolute w-[180px] h-[180px] rounded-full border border-cyan-500/25 pointer-events-none" />
            <div className="absolute w-[320px] h-[320px] rounded-full border border-purple-500/20 border-dashed pointer-events-none" />
            <div className="absolute w-[460px] h-[460px] rounded-full border border-rose-500/20 border-dotted pointer-events-none" />

            {/* Central Course Nucleus */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 border border-cyan-400/60 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              <Brain className="w-6 h-6 text-cyan-300 animate-pulse" />
              <span className="text-[9px] font-bold font-mono text-white mt-0.5">{activeClassMeta.key.toUpperCase()}</span>
            </div>

            {/* Spatial Student Nodes */}
            {spatialStudents.map((st) => {
              const isFlagged = st.status === 'flagged'
              const isSelected = spatialHoverStudent?.id === st.id

              return (
                <div
                  key={st.id}
                  onClick={() => {
                    setSpatialHoverStudent(st)
                    setSelectedStudentForGraph(st.id.toLowerCase().replace('-', ''))
                  }}
                  onMouseEnter={() => setSpatialHoverStudent(st)}
                  style={{
                    position: 'absolute',
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                  }}
                  className="group -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                >
                  <div className={`relative p-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    isFlagged
                      ? 'bg-rose-500/20 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                  } ${isSelected ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${isFlagged ? 'bg-rose-400' : 'bg-cyan-400'}`} />
                    <span className="text-[11px] font-mono font-bold text-white">{st.id}</span>
                  </div>
                </div>
              )
            })}

            {/* Holographic Student Info Card on Hover/Click */}
            {spatialHoverStudent && (
              <div className="absolute bottom-4 right-4 z-30 p-4 rounded-xl bg-[#0F172A]/95 backdrop-blur-xl border border-cyan-400/50 shadow-2xl max-w-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-white/10">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${spatialHoverStudent.status === 'flagged' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                    {spatialHoverStudent.name}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">{spatialHoverStudent.mastery}% Mastery</span>
                </div>
                {spatialHoverStudent.bottleneck && (
                  <div className="text-[11px] text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    ⚠️ <b>Prerequisite Bottleneck:</b> {spatialHoverStudent.bottleneck}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => openRemedialCreatorForStudent(spatialHoverStudent)}
                    className="py-1 px-2.5 rounded-lg text-[10px] font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all"
                  >
                    Create Remedial Game
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpatialHoverStudent(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── 3. CONCEPT MASTERY HEATMAP MATRIX ─── */}
      {activeViewTab === 'heatmap' && (
        <section className="card p-6 bg-[#070A14]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-white">
                {activeDataset.name} · Student Concept Heatmap
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Computed deterministically from session submissions. Hatched = No data. Dashed with * = Low confidence.
              </p>
            </div>
            <span className="badge text-[10px] font-mono">{activeClassMeta.n}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2 px-3">Student Token</th>
                  {activeDataset.topics?.map((t) => (
                    <th key={t} className="py-2 px-3">{cap(t)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.entries(activeDataset.heatmap || {}).map(([studentId, scores]) => (
                  <tr key={studentId} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-mono text-cyan-300 font-semibold">{studentId}</td>
                    {scores.map((val, i) => (
                      <td key={i} className="py-2 px-3">{renderCell(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── 4. ACCURACY TRAJECTORY CURVES ─── */}
      {activeViewTab === 'trajectory' && (
        <section className="card p-6 bg-[#070A14]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold font-display text-white">
                Session Accuracy Development Trajectory
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Focus Student:</span>
              <select
                value={selectedStudentForGraph}
                onChange={(e) => setSelectedStudentForGraph(e.target.value)}
                className="py-1 px-2.5 rounded-lg bg-[#0F172A] border border-white/20 text-xs text-white outline-none"
              >
                <option value="s004">S-004 (Needs Support · 30%)</option>
                <option value="s011">S-011 (Needs Support · 28%)</option>
                <option value="s002">S-002 (Mastery Growth · 85%)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#05070D] border border-white/10">
            <svg viewBox="0 0 540 180" className="w-full h-44 overflow-visible" aria-label="Student accuracy progress graph over sessions">
              {[40, 80, 120, 160].map((y, i) => (
                <line key={i} x1="40" y1={y} x2="520" y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              ))}
              <text x="30" y="45" fill="#94A3B8" fontSize="10" textAnchor="end">100%</text>
              <text x="30" y="85" fill="#94A3B8" fontSize="10" textAnchor="end">75%</text>
              <text x="30" y="125" fill="#94A3B8" fontSize="10" textAnchor="end">50%</text>
              <text x="30" y="165" fill="#94A3B8" fontSize="10" textAnchor="end">25%</text>

              {/* Class Average Trajectory */}
              {(() => {
                const pts = trajectory.map((t, idx) => `${70 + idx * 140},${180 - t.avg * 1.5}`).join(' ')
                return <polyline fill="none" stroke="#22D3EE" strokeWidth="2.5" points={pts} />
              })()}

              {/* Selected Student Trajectory */}
              {(() => {
                const studentPts = trajectory.map((t, idx) => {
                  const val = t[selectedStudentForGraph] || 30
                  return `${70 + idx * 140},${180 - val * 1.5}`
                }).join(' ')
                const isWeak = selectedStudentForGraph !== 's002'
                return (
                  <polyline
                    fill="none"
                    stroke={isWeak ? '#F43F5E' : '#34D399'}
                    strokeWidth="2.5"
                    strokeDasharray={isWeak ? '4 4' : 'none'}
                    points={studentPts}
                  />
                )
              })()}

              {trajectory.map((t, idx) => {
                const cx = 70 + idx * 140
                const cyAvg = 180 - t.avg * 1.5
                const cyStudent = 180 - (t[selectedStudentForGraph] || 30) * 1.5
                return (
                  <g key={t.session}>
                    <circle cx={cx} cy={cyAvg} r="4" fill="#05070D" stroke="#22D3EE" strokeWidth="2" />
                    <text x={cx} y={cyAvg - 8} fill="#22D3EE" fontSize="10" textAnchor="middle" fontWeight="bold">
                      {t.avg}%
                    </text>
                    <circle cx={cx} cy={cyStudent} r="4" fill="#05070D" stroke={selectedStudentForGraph === 's002' ? '#34D399' : '#F43F5E'} strokeWidth="2" />
                    <text x={cx} y={cyStudent + 15} fill={selectedStudentForGraph === 's002' ? '#34D399' : '#F43F5E'} fontSize="10" textAnchor="middle">
                      {t[selectedStudentForGraph]}%
                    </text>
                    <text x={cx} y="175" fill="#94A3B8" fontSize="11" textAnchor="middle" fontWeight="600">
                      Session {t.session}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </section>
      )}

      {/* ─── 5. TARGETED REMEDIAL INTERVENTIONS WORKBENCH ─── */}
      <section className="card p-6 bg-[#070A14]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-display text-white">
              Targeted Remedial Interventions & Teacher Approval
            </h3>
          </div>
          <span className="badge text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40 font-mono">
            Human-in-the-Loop Gate
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Deterministic Diagnostic Root-Cause Analysis:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <b>{report.studentId}</b> mastery in <b>{report.concept}</b> is {report.conceptScore}, below the 50% threshold. Prerequisite bottleneck: <b>{report.rootCause}</b>. Similar pattern observed in peers: {report.peers}.
          </p>
        </div>

        {draftState === 0 ? (
          <button
            type="button"
            onClick={() => {
              setDraftState(1)
              onToast?.(`Drafted remedial support task for ${report.studentId} and peers`)
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Targeted Support Task ({report.flagsCount} Flagged Students)</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-[#0F172A] border border-cyan-500/40 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="badge bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-mono">
                {draftState === 2 ? '✓ Teacher Approved' : 'AI Draft (Pending Approval)'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Grounded in: {activeDataset.fullTitle}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold font-display text-white">{report.taskTitle}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Remedial practice task targeting unaddressed foundational gap in {report.rootCause}.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              {draftState === 2 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved & Pushed to Student Rosters (S-004, S-007, S-011)</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftState(2)
                      onToast?.('Task approved and dispatched to student notebooks!')
                    }}
                    className="py-2 px-4 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Assign to Students</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftState(0)}
                    className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white transition-all"
                  >
                    Discard Draft
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ─── IN-BUILT TEACHER AI ASSISTANT CO-PILOT ─── */}
      <TeacherAiAssistant
        activeClassName={activeClassMeta.n}
        isOpen={aiCoPilotOpen}
        onClose={() => setAiCoPilotOpen(false)}
        onApplyTask={() => {
          setDraftState(1)
          setAiCoPilotOpen(false)
          onToast?.('Task dispatched to teacher approval deck')
        }}
      />

      {/* ─── LECTURE NOTES IMPORTER MODAL ─── */}
      <LectureNotesImporterModal
        isOpen={notesImporterOpen}
        onClose={() => setNotesImporterOpen(false)}
        activeCourseName={activeClassMeta.n}
        onNoteImported={(imported) => {
          onToast?.(`Imported and published "${imported.title}" to syllabus!`)
        }}
      />

      {/* ─── REMEDIAL GAME CREATOR MODAL ─── */}
      <RemedialGameCreatorModal
        isOpen={remedialModalOpen}
        onClose={() => setRemedialModalOpen(false)}
        student={remedialTargetStudent}
        onGameDeployed={(game) => {
          onToast?.(`Deployed custom ${game.type} game to ${game.targetStudentId}!`)
        }}
      />
    </div>
  )
}
