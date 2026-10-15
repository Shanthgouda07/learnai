import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Flame, Zap, Sliders, Keyboard, Sun, Moon,
  LogOut, Shield, Telescope, Compass, User
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useAccessibilityStore } from '../store/accessibilityStore'
import LearnAILogo from './LearnAILogo'

/**
 * Learning Universe Slim Top HUD
 * Telemetry bar featuring constellation 'L' logo, circular progress ring,
 * XP points, streak flame, quick theme toggle, and accessibility trigger.
 */
export default function TopHUD({
  progress = 68,
  points = 1240,
  streak = 5,
  showTelemetry = true,
  className = '',
}) {
  const { user, logout } = useAuthStore()
  const { theme, setTheme, openDrawer, openShortcutsDialog } = useAccessibilityStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Circular progress calculations for SVG ring
  const ringRadius = 14
  const circumference = 2 * Math.PI * ringRadius
  const strokeDashoffset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference

  const isDark = theme === 'dark' || (theme === 'system' && (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true))

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <header
      role="banner"
      aria-label="Learning Universe Navigation and Telemetry HUD"
      className={`mission-hud w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 border-b border-[var(--color-border)] select-none ${className}`}
    >
      {/* Left: Constellation Brand & Navigation */}
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        <Link
          to={user?.role === 'teacher' ? '/teacher' : '/student'}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl p-1"
          title="LearnAI: Read it. Play it. Master it."
        >
          <LearnAILogo size="sm" withText={true} />
        </Link>

        {/* Space Role Pill */}
        {user?.role && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-card-muted)] border border-[var(--color-border)] text-xs text-[var(--color-ink-muted)]">
            {user.role === 'teacher' ? (
              <>
                <Telescope className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-[var(--color-ink)]">Class Observatory</span>
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-[var(--color-ink)]">My Universe</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Center: Live Universe Progress Telemetry */}
      {showTelemetry && (
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Circular Orbit Progress */}
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[var(--color-card-muted)] border border-[var(--color-border)]"
            title={`Concept Universe Mastery: ${progress}%`}
          >
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r={ringRadius}
                  className="stroke-[rgba(255,255,255,0.08)] fill-none"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r={ringRadius}
                  className="stroke-cyan-400 fill-none transition-all duration-700 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono text-[9px] font-bold text-[var(--color-ink)]">
                {progress}%
              </span>
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider font-mono">Mastery Journey</div>
              <div className="text-xs font-semibold text-cyan-400">Play & Practice</div>
            </div>
          </div>

          {/* Points / XP Pill (Warm Amber) */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] shadow-[0_0_12px_rgba(245,158,11,0.15)]"
            title={`${points} Learning XP earned`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400">
              {points.toLocaleString()} <span className="text-[10px] font-sans font-normal opacity-85">XP</span>
            </span>
          </div>

          {/* Streak Flame Pill (Warm Amber) */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-card-muted)] border border-[var(--color-border)]"
            title={`${streak}-day active practice streak`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span className="font-mono text-xs font-bold text-[var(--color-ink)]">
              {streak} <span className="text-[10px] font-sans text-[var(--color-ink-muted)] font-normal">days</span>
            </span>
          </div>
        </div>
      )}

      {/* Right: Quick Controls & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Component Preview Link */}
        <Link
          to="/preview"
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-cyan-400 bg-cyan-400/10 border border-cyan-400/25 hover:border-cyan-400 transition-all min-h-[44px]"
          title="Inspect Learning Universe Design Tokens, MasteryStar & Components"
        >
          <span>Preview UI</span>
        </Link>

        {/* Theme Quick Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          title={`Switch to ${isDark ? 'Clean Aerospace Light' : 'Deep Universe Dark'} mode`}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-card-muted)] border border-transparent hover:border-[var(--color-border)] transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button
          type="button"
          onClick={openShortcutsDialog}
          aria-label="Open keyboard shortcuts"
          title="Keyboard shortcuts"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-card-muted)] border border-transparent hover:border-[var(--color-border)] transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Accessibility Drawer Trigger */}
        <button
          type="button"
          id="hud-a11y-trigger"
          onClick={openDrawer}
          aria-label="Open accessibility and view settings"
          title="Accessibility settings (fonts, zoom, high contrast, reduced motion)"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:text-cyan-400 hover:bg-cyan-400/10 border border-transparent hover:border-cyan-400/30 transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* User Info / Logout */}
        {user ? (
          <div className="flex items-center gap-2 pl-1 border-l border-[var(--color-border)] ml-1">
            <div
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--color-card-muted)] to-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold text-cyan-400"
              title={`${user.name} (${user.anon_id || 'ID'})`}
            >
              {user.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-[var(--color-ink-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
