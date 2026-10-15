import React, { useState, useEffect } from 'react'
import {
  Shield, Download, Trash2, Clock, CheckCircle2,
  AlertTriangle, RefreshCw, Eye
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function TeacherPrivacyPanel({ classId = 1 }) {
  const [settings, setSettings] = useState({ retention_months: 12, parental_consent_obtained: false })
  const [deletionRequests, setDeletionRequests] = useState([])
  const [accessLogs, setAccessLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [sRes, dRes, aRes] = await Promise.all([
        axios.get(`/api/privacy/class/${classId}/settings`),
        axios.get(`/api/privacy/class/${classId}/deletion-requests`),
        axios.get(`/api/privacy/class/${classId}/access-log`),
      ])
      setSettings(sRes.data)
      setDeletionRequests(dRes.data)
      setAccessLogs(aRes.data)
    } catch (err) {
      console.warn('Failed to load teacher privacy panel data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [classId])

  const handleUpdateSettings = async (updates) => {
    setSavingSettings(true)
    try {
      const res = await axios.patch(`/api/privacy/class/${classId}/settings`, updates)
      setSettings(res.data)
      toast.success('Class privacy settings updated.')
    } catch (err) {
      toast.error('Failed to update settings: ' + (err.response?.data?.detail || err.message))
    } finally {
      setSavingSettings(false)
    }
  }

  const handleApproveDeletion = async (requestId, studentAnonId) => {
    if (!window.confirm(`Approve data deletion for student ${studentAnonId}? Personal records will be hard deleted and session metrics preserved as anonymized aggregates.`)) {
      return
    }

    try {
      const res = await axios.post(`/api/privacy/deletion-requests/${requestId}/approve`)
      if (res.data.success) {
        toast.success(`Deletion approved for ${studentAnonId}.`)
        loadAll()
      }
    } catch (err) {
      toast.error('Approval failed: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleExportCsv = () => {
    window.location.href = `/api/privacy/class/${classId}/export`
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & One-Click CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 notebook-card p-5">
        <div>
          <h3 className="text-base font-bold text-[var(--color-ink)] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--color-teal)]" />
            <span>Class Data Privacy & Governance</span>
          </h3>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1">
            Manage data retention, review parental consent, approve student deletion requests, and review access logs.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="notebook-btn-secondary text-xs py-2 px-4 shadow-sm"
        >
          <Download className="w-4 h-4 text-[var(--color-teal)]" />
          <span>Export Class Progress (CSV)</span>
        </button>
      </div>

      {/* 2. Retention Setting & Parental Consent Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Retention Setting */}
        <div className="notebook-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-[var(--color-teal)] font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Data Retention Policy</span>
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Automatically purge practice sessions and logs older than the chosen retention threshold using <code className="bg-[var(--color-border-subtle)] px-1 py-0.5 rounded font-mono">python -m app.privacy.purge</code>.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <select
              value={settings.retention_months || 12}
              onChange={(e) => handleUpdateSettings({ retention_months: parseInt(e.target.value) })}
              disabled={savingSettings}
              className="notebook-input text-xs py-2 px-3 font-semibold"
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months (Standard School Year)</option>
              <option value={24}>24 Months</option>
              <option value={36}>36 Months</option>
            </select>
            <span className="text-xs text-[var(--color-ink-muted)]">
              {savingSettings ? 'Saving...' : 'Current retention'}
            </span>
          </div>
        </div>

        {/* Parental Consent Checkbox */}
        <div className="notebook-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-[var(--color-teal)] font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Parental / Guardian Consent</span>
          </div>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Record that parental or guardian consent forms have been gathered for students under 18 enrolled in this class.
          </p>
          <label className="flex items-center gap-3 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.parental_consent_obtained)}
              onChange={(e) => handleUpdateSettings({ parental_consent_obtained: e.target.checked })}
              disabled={savingSettings}
              className="w-4 h-4 accent-[var(--color-teal)]"
            />
            <span className="text-xs font-semibold text-[var(--color-ink)]">
              Parental consent obtained for this class
            </span>
          </label>
        </div>
      </div>

      {/* 3. Pending Deletion Requests */}
      <div className="notebook-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-[var(--color-ink)] flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Pending Student Deletion Requests</span>
          </h4>
          <span className="notebook-badge notebook-badge-amber">
            {deletionRequests.filter(r => r.status === 'pending').length} pending
          </span>
        </div>

        {deletionRequests.length === 0 ? (
          <p className="text-xs text-[var(--color-ink-muted)] italic py-2">
            No pending student deletion requests for this class.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-card-muted)] text-[var(--color-ink-muted)] font-semibold border-b border-[var(--color-border)]">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Requested At</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-ink)]">
                {deletionRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--color-card-muted)]">
                    <td className="py-2.5 px-3 font-semibold">
                      {r.student_name} ({r.student_anon_id})
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`notebook-badge ${r.status === 'approved' ? 'notebook-badge-teal' : 'notebook-badge-amber'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--color-ink-muted)]">
                      {r.requested_at ? new Date(r.requested_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--color-ink-muted)]">
                      {r.reason || 'None specified'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {r.status === 'pending' ? (
                        <button
                          onClick={() => handleApproveDeletion(r.id, r.student_anon_id)}
                          className="py-1 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
                        >
                          Approve Deletion
                        </button>
                      ) : (
                        <span className="text-[var(--color-ink-muted)] text-xs">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Access Log Audit Table (Anon IDs only, never names) */}
      <div className="notebook-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-[var(--color-ink)] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--color-teal)]" />
              <span>Student Detail Access Audit Log</span>
            </h4>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
              Strictly pseudonymized audit trail. Displays anon_ids only, never personal names.
            </p>
          </div>
          <button
            onClick={loadAll}
            aria-label="Refresh access log"
            className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {accessLogs.length === 0 ? (
          <p className="text-xs text-[var(--color-ink-muted)] italic py-2">
            No access log entries recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-card-muted)] text-[var(--color-ink-muted)] font-semibold border-b border-[var(--color-border)] sticky top-0">
                <tr>
                  <th className="py-2 px-3">Viewer Anon ID</th>
                  <th className="py-2 px-3">Viewer Role</th>
                  <th className="py-2 px-3">Target Student Anon ID</th>
                  <th className="py-2 px-3">Page / View</th>
                  <th className="py-2 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-ink)]">
                {accessLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[var(--color-card-muted)]">
                    <td className="py-2 px-3 font-mono font-semibold text-[var(--color-teal)]">
                      {l.viewer_anon_id}
                    </td>
                    <td className="py-2 px-3 uppercase text-[10px] font-semibold text-[var(--color-ink-muted)]">
                      {l.viewer_role}
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold">
                      {l.target_anon_id}
                    </td>
                    <td className="py-2 px-3 text-[var(--color-ink-muted)]">
                      {l.page}
                    </td>
                    <td className="py-2 px-3 text-[var(--color-ink-muted)]">
                      {l.timestamp ? new Date(l.timestamp).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
