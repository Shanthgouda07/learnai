import React, { useState, useEffect } from 'react'
import {
  ShieldCheck, Download, Trash2, Cpu, Eye, FileText,
  Clock, CheckCircle, ArrowLeft, AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import DataStoredTable from './DataStoredTable'
import AiTransparencyCard from './AiTransparencyCard'
import DeleteRequestDialog from './DeleteRequestDialog'
import TeacherPrivacyPanel from './TeacherPrivacyPanel'

export default function PrivacyCenter() {
  const { user } = useAuthStore()
  const isStudent = user?.role === 'student'
  const isTeacher = user?.role === 'teacher'

  const [activeTab, setActiveTab] = useState(isStudent ? 'what_we_store' : 'teacher_panel')
  const [myData, setMyData] = useState(null)
  const [consentInfo, setConsentInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      if (isStudent) {
        const [dRes, cRes] = await Promise.all([
          axios.get('/api/privacy/my-data'),
          axios.get('/api/consent'),
        ])
        setMyData(dRes.data)
        setConsentInfo(cRes.data)
      } else {
        const cRes = await axios.get('/api/consent')
        setConsentInfo(cRes.data)
      }
    } catch (err) {
      console.warn('Failed to load privacy center data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleDownloadMyData = () => {
    window.location.href = '/api/privacy/export'
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              to={isTeacher ? '/teacher/desk' : '/student'}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-teal)] hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {isTeacher ? 'Teacher Desk' : 'Student Home'}</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] flex items-center gap-2.5">
              <ShieldCheck className="w-8 h-8 text-[var(--color-teal)]" />
              <span>Privacy & Ethics Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
              Complete transparency into what data is stored, how the AI is guarded, and your rights to export or delete.
            </p>
          </div>

          {/* Student Export & Deletion Action Buttons */}
          {isStudent && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadMyData}
                className="notebook-btn-secondary text-xs py-2 px-3.5 shadow-sm"
              >
                <Download className="w-4 h-4 text-[var(--color-teal)]" />
                <span>Download My Data (JSON)</span>
              </button>

              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="py-2 px-3.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Request Deletion</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[var(--color-border)] flex items-center gap-2 overflow-x-auto pb-1">
          {isTeacher && (
            <button
              onClick={() => setActiveTab('teacher_panel')}
              className={`py-2 px-4 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'teacher_panel'
                  ? 'bg-[var(--color-teal-wash)] text-[var(--color-teal)] border border-[var(--color-teal)]'
                  : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              Class Privacy & Retention
            </button>
          )}

          <button
            onClick={() => setActiveTab('what_we_store')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'what_we_store'
                ? 'bg-[var(--color-teal-wash)] text-[var(--color-teal)] border border-[var(--color-teal)]'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            What We Store
          </button>

          <button
            onClick={() => setActiveTab('ai_transparency')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'ai_transparency'
                ? 'bg-[var(--color-teal-wash)] text-[var(--color-teal)] border border-[var(--color-teal)]'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            What the AI Sees
          </button>

          <button
            onClick={() => setActiveTab('consent_history')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'consent_history'
                ? 'bg-[var(--color-teal-wash)] text-[var(--color-teal)] border border-[var(--color-teal)]'
                : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            Consent History
          </button>
        </div>

        {/* Content Panes */}
        <div className="pt-2">
          {activeTab === 'teacher_panel' && isTeacher && (
            <TeacherPrivacyPanel classId={1} />
          )}

          {activeTab === 'what_we_store' && (
            <div className="space-y-6">
              <DataStoredTable myData={myData} />
              {isStudent && (
                <div className="notebook-card p-5 bg-[var(--color-card-muted)] border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-ink)]">
                      Want an offline copy of your educational records?
                    </h4>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                      Download a structured JSON file containing your profile, reading progress, practice scores, and AI interaction logs.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadMyData}
                    className="notebook-btn-primary text-xs py-2 px-4 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Export</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai_transparency' && (
            <AiTransparencyCard />
          )}

          {activeTab === 'consent_history' && (
            <div className="notebook-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-ink)]">
                    Privacy Terms & Consent Record
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    Current system terms version: <strong className="text-[var(--color-teal)] font-mono">v{consentInfo?.current_version || '1.0'}</strong>
                  </p>
                </div>
                <span className="notebook-badge notebook-badge-teal flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{consentInfo?.has_consented ? 'Consent Active' : 'Pending Consent'}</span>
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-card-muted)] text-[var(--color-ink-muted)] font-semibold border-b border-[var(--color-border)]">
                    <tr>
                      <th className="py-2.5 px-3">Terms Version</th>
                      <th className="py-2.5 px-3">Language</th>
                      <th className="py-2.5 px-3">Accepted At</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-ink)]">
                    {(consentInfo?.consents || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-[var(--color-ink-muted)] italic">
                          No prior consent records logged for this user.
                        </td>
                      </tr>
                    ) : (
                      consentInfo.consents.map((c, i) => (
                        <tr key={i} className="hover:bg-[var(--color-card-muted)]">
                          <td className="py-2.5 px-3 font-mono font-semibold text-[var(--color-teal)]">
                            v{c.version}
                          </td>
                          <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-[var(--color-ink-muted)]">
                            {c.language}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--color-ink-muted)]">
                            {c.accepted_at ? new Date(c.accepted_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="notebook-badge notebook-badge-teal text-[10px]">
                              Valid Agreement
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Deletion Dialog */}
      <DeleteRequestDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSubmitted={loadData}
      />
    </div>
  )
}
