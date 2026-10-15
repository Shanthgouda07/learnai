import React, { useState, useEffect } from 'react'
import {
  Brain, BarChart3, Grid, AlertTriangle, ListFilter,
  Layers, ChevronDown, Sparkles, MessageSquare, ShieldCheck
} from 'lucide-react'
import api from '../../services/api'
import OverviewTab from './OverviewTab'
import HeatmapTab from './HeatmapTab'
import AttentionTab from './AttentionTab'
import SessionsTab from './SessionsTab'
import StudentDetailPage from './StudentDetailPage'
import InterventionsTab from './InterventionsTab'
import SupportTaskDrawer from './SupportTaskDrawer'
import DeskChat from './DeskChat'
import TeacherPrivacyPanel from '../privacy/TeacherPrivacyPanel'
import toast from 'react-hot-toast'

interface ClassOption {
  id: number
  name: string
}

export default function DeskLayout() {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [activeClassId, setActiveClassId] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerStudents, setDrawerStudents] = useState<{ id: number; anon_id: string; name: string }[]>([])
  const [drawerTopic, setDrawerTopic] = useState<string>('variables')

  // Data states
  const [overview, setOverview] = useState<any>(null)
  const [heatmapData, setHeatmapData] = useState<any>(null)
  const [flags, setFlags] = useState<any[]>([])
  const [interventions, setInterventions] = useState<any[]>([])
  const [includeDismissed, setIncludeDismissed] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  // 1. Fetch Teacher's Classes
  useEffect(() => {
    // In seed, teacher has classes 1, 2, 3
    api.get('/notes/') // We can probe or set default classes
      .catch(() => {})
    
    // Seeded classes for teacher
    const defaultClasses: ClassOption[] = [
      { id: 1, name: 'Python Foundations' },
      { id: 2, name: 'Web & Scripting' },
      { id: 3, name: 'Advanced CS Explorers' },
    ]
    setClasses(defaultClasses)
    setActiveClassId(1)
  }, [])

  // 2. Fetch class desk data whenever activeClassId changes
  const fetchDeskData = async () => {
    if (!activeClassId) return
    setLoading(true)
    try {
      const [overviewRes, heatmapRes, flagsRes, intervRes] = await Promise.all([
        api.get(`/desk/classes/${activeClassId}/overview`),
        api.get(`/desk/classes/${activeClassId}/heatmap`),
        api.get(`/desk/classes/${activeClassId}/flags?include_dismissed=${includeDismissed}`),
        api.get(`/desk/classes/${activeClassId}/interventions`),
      ])

      setOverview(overviewRes.data)
      setHeatmapData(heatmapRes.data)
      setFlags(flagsRes.data.flags || [])
      setInterventions(intervRes.data || [])
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to load class analytics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeskData()
  }, [activeClassId, includeDismissed])

  // Open drawer with specific students & topic
  const handleOpenDrawer = (
    targetStudents: { id: number; anon_id: string; name: string }[],
    topic: string
  ) => {
    setDrawerStudents(targetStudents)
    setDrawerTopic(topic)
    setDrawerOpen(true)
  }

  // Handle drilldown from heatmap or recent activity
  const handleSelectStudent = (studentIdOrAnon: number | string, initialTopic?: string) => {
    if (typeof studentIdOrAnon === 'number') {
      setSelectedStudentId(studentIdOrAnon)
    } else {
      // Find student by anon_id
      const st = heatmapData?.students?.find((s: any) => s.anon_id === studentIdOrAnon)
      if (st) {
        setSelectedStudentId(st.id)
      }
    }
    setActiveTab('student_detail')
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Title and Class Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Teacher AI Desk</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded diagnostic analytics, prerequisite tracing, and one-click targeted support tasks.
          </p>
        </div>

        {/* Class Context Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-2xl px-3.5 py-1.5 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Class:</span>
          <select
            value={activeClassId}
            onChange={(e) => {
              setActiveClassId(Number(e.target.value))
              setSelectedStudentId(null)
            }}
            className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer pr-2"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="flex items-center gap-1.5 border-b border-surface-border pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'heatmap', label: 'Mastery Heatmap', icon: Grid },
          {
            id: 'attention',
            label: 'Needs Attention',
            icon: AlertTriangle,
            badge: flags.length > 0 ? flags.length : undefined,
          },
          { id: 'sessions', label: 'Sessions Log', icon: ListFilter },
          {
            id: 'interventions',
            label: 'Support Outcomes',
            icon: Layers,
            badge: interventions.length > 0 ? interventions.length : undefined,
          },
          {
            id: 'privacy',
            label: 'Privacy & Retention',
            icon: ShieldCheck,
          },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id)
                setSelectedStudentId(null)
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    tab.id === 'attention'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}

        {/* Student Detail Tab indicator if drilled in */}
        {selectedStudentId && activeTab === 'student_detail' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 ml-auto">
            <span>Student Profile</span>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            overview={overview}
            loading={loading}
            onTabChange={(t) => setActiveTab(t)}
            onSelectStudent={(anon) => handleSelectStudent(anon)}
          />
        )}

        {activeTab === 'heatmap' && (
          <HeatmapTab
            data={heatmapData}
            loading={loading}
            onSelectStudentTopic={(sid, topic) => handleSelectStudent(sid, topic)}
          />
        )}

        {activeTab === 'attention' && (
          <AttentionTab
            flags={flags}
            loading={loading}
            onGenerateSupportTask={handleOpenDrawer}
            onSelectStudent={(sid) => handleSelectStudent(sid)}
            onRefresh={fetchDeskData}
            includeDismissed={includeDismissed}
            onToggleIncludeDismissed={setIncludeDismissed}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsTab
            classId={activeClassId}
            onSelectStudent={(anon) => handleSelectStudent(anon)}
          />
        )}

        {activeTab === 'interventions' && (
          <InterventionsTab
            interventions={interventions}
            loading={loading}
            onSelectStudent={(anon) => handleSelectStudent(anon)}
          />
        )}

        {activeTab === 'privacy' && (
          <TeacherPrivacyPanel classId={activeClassId} />
        )}

        {activeTab === 'student_detail' && selectedStudentId && (
          <StudentDetailPage
            studentId={selectedStudentId}
            classId={activeClassId}
            onBack={() => setActiveTab('heatmap')}
            onGenerateSupportTask={handleOpenDrawer}
          />
        )}
      </div>

      {/* Support Task Builder Drawer */}
      <SupportTaskDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        classId={activeClassId}
        initialStudents={drawerStudents}
        initialTopic={drawerTopic}
        availableStudents={heatmapData?.students || []}
        onApproved={() => {
          fetchDeskData()
          setActiveTab('interventions')
        }}
      />

      {/* Floating Ask the Desk Assistant */}
      <DeskChat
        classId={activeClassId}
        onSelectStudent={(anon) => handleSelectStudent(anon)}
      />
    </div>
  )
}
