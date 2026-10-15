import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Heart, Sliders, Keyboard } from 'lucide-react'
import { useAccessibilityStore } from '../store/accessibilityStore'

export default function Footer() {
  const { toggleDrawer, openShortcutsDialog } = useAccessibilityStore()

  return (
    <footer
      role="contentinfo"
      className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-card)] py-6 px-4 sm:px-8 text-xs text-[var(--color-ink-muted)]"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Mission */}
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-tight text-sm text-[var(--color-ink)] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-teal)] inline-block"></span>
            LearnAI Studio
          </span>
          <span>•</span>
          <span>Calm notebook learning platform</span>
        </div>

        {/* Links: Privacy Center, Accessibility, Shortcuts */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
          <Link
            to="/privacy"
            className="flex items-center gap-1.5 text-[var(--color-ink)] hover:text-[var(--color-teal)] transition-colors underline-offset-4 hover:underline"
          >
            <ShieldCheck className="w-4 h-4 text-[var(--color-teal)]" />
            <span>Privacy & Ethics Center</span>
          </Link>

          <button
            onClick={toggleDrawer}
            className="flex items-center gap-1.5 text-[var(--color-ink)] hover:text-[var(--color-teal)] transition-colors touch-target"
          >
            <Sliders className="w-4 h-4" />
            <span>Accessibility Settings</span>
          </button>

          <button
            onClick={openShortcutsDialog}
            className="flex items-center gap-1.5 text-[var(--color-ink)] hover:text-[var(--color-teal)] transition-colors touch-target"
          >
            <Keyboard className="w-4 h-4" />
            <span>Shortcuts (?)</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
