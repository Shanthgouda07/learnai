/**
 * Mission Control Teacher Layout
 * Dark command center styling with flight director telemetry.
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BookOpen, Gamepad2, LogOut,
  Brain, LayoutDashboard, Code2, Sparkles, Shield, Radar
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import TopHUD from '../../components/TopHUD'

const NAV = [
  { to: '/teacher',            label: 'Classes Overview', icon: LayoutDashboard, end: true },
  { to: '/teacher/notes',      label: 'Curriculum Notes', icon: BookOpen },
  { to: '/teacher/games',      label: 'Mission Games',    icon: Gamepad2 },
  { to: '/teacher/activity',   label: 'Telemetry Stream', icon: Sparkles },
  { to: '/teacher/desk',       label: 'AI Mission Desk',  icon: Brain },
  { to: '/visualizer',         label: 'Visualizer',       icon: Code2 },
]

export default function TeacherLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-card)] border-r border-[var(--color-border)] flex flex-col py-6 px-4 fixed h-full z-20">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center">
            <div className="w-full h-full bg-[#05070D] rounded-[10px] flex items-center justify-center">
              <Radar className="w-5 h-5 text-[var(--color-teal)]" />
            </div>
          </div>
          <div>
            <div className="text-base font-bold font-display text-[var(--color-ink)] flex items-center gap-1.5">
              LearnAI
            </div>
            <div className="text-[11px] font-mono tracking-wider text-[var(--color-teal)] uppercase">
              Mission Control
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-[var(--color-teal-wash)] text-[var(--color-teal)] border border-[rgba(0,240,255,0.35)] shadow-[0_0_15px_rgba(0,240,255,0.15)] font-bold'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-card-muted)] border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card */}
        <div className="mt-auto pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--color-card-muted)] to-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-teal)] text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-[var(--color-ink)] font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-[var(--color-ink-muted)] font-mono">{user?.anon_id}</div>
            </div>
          </div>
          <button
            id="teacher-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--color-ink-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all min-h-[44px]"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <TopHUD />
        <main className="flex-1 p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
