import React from 'react'
import { Shield, Eye, Lock, FileText, Activity, MessageSquare } from 'lucide-react'

export default function DataStoredTable({ myData }) {
  const profile = myData?.profile || {}
  const enrollments = myData?.enrollments || []
  const noteProgress = myData?.note_progress || []
  const sessions = myData?.sessions || []
  const helperFeedback = myData?.helper_feedback || []

  const categories = [
    {
      name: 'Account & Identity',
      icon: Lock,
      count: profile.anon_id ? '1 profile' : 'None',
      summary: `Pseudonym: ${profile.anon_id || 'N/A'}. Real Name visible only to you: ${profile.name || 'N/A'}`,
      access: 'Student and Teacher',
      aiAccess: 'NEVER sent to AI (only anon_id)',
    },
    {
      name: 'Class Enrollments',
      icon: Eye,
      count: `${enrollments.length} classes`,
      summary: enrollments.map(e => e.class_name).join(', ') || 'No classes enrolled',
      access: 'Teacher and School',
      aiAccess: 'Not shared with AI',
    },
    {
      name: 'Notes & Reading Progress',
      icon: FileText,
      count: `${noteProgress.length} notes tracked`,
      summary: `${noteProgress.filter(p => p.read_check_passed).length} recall checks passed`,
      access: 'Student and Teacher',
      aiAccess: 'Curriculum excerpts only',
    },
    {
      name: 'Practice & Game Sessions',
      icon: Activity,
      count: `${sessions.length} sessions completed`,
      summary: 'Timestamps, scores, accuracy, and topic practice history',
      access: 'Student and Teacher',
      aiAccess: 'Anonymized topic error rates only',
    },
    {
      name: 'AI Helper Interactions',
      icon: MessageSquare,
      count: `${helperFeedback.length} interactions`,
      summary: 'Questions asked, helpful ratings, and sanitization logs',
      access: 'Student and Teacher (anonymized)',
      aiAccess: 'Sanitized questions only',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--color-ink)] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--color-teal)]" />
          <span>Categories of Stored Data</span>
        </h3>
        <span className="text-xs text-[var(--color-ink-muted)]">
          Real names are visible only to you and your verified teacher
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--color-card-muted)] border-b border-[var(--color-border)] text-[var(--color-ink-muted)] font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Details</th>
              <th className="py-3 px-4">Who can view</th>
              <th className="py-3 px-4">AI Boundary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-ink)]">
            {categories.map((c, i) => {
              const Icon = c.icon
              return (
                <tr key={i} className="hover:bg-[var(--color-card-muted)] transition-colors">
                  <td className="py-3 px-4 font-semibold flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[var(--color-teal)] shrink-0" />
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-ink-muted)] whitespace-nowrap">
                    {c.count}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-[var(--color-ink-muted)]">
                    {c.summary}
                  </td>
                  <td className="py-3 px-4">
                    <span className="notebook-badge notebook-badge-teal">
                      {c.access}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="notebook-badge notebook-badge-amber">
                      {c.aiAccess}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
