import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock, Eye, EyeOff, GraduationCap, Telescope,
  Compass, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'
import LearnAILogo from '../components/LearnAILogo'
import StarfieldSky from '../components/StarfieldSky'

export default function LoginPage() {
  const [anonId, setAnonId]     = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login } = useAuthStore()
  const navigate  = useNavigate()

  const handleLogin = async (idToUse, passToUse) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        anon_id: idToUse.trim(),
        password: passToUse,
      })
      login(data.access_token, {
        user_id: data.user_id,
        role:    data.role,
        anon_id: data.anon_id,
        name:    data.name,
      })
      toast.success(`Welcome to ${data.role === 'teacher' ? 'Class Observatory' : 'Learning Universe'}, ${data.name}!`)
      navigate(data.role === 'teacher' ? '/teacher' : '/student')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Login failed. Check your ID and password.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleLogin(anonId, password)
  }

  // Quick 1-click sample login for testing
  const quickLogin = (id, pass) => {
    setAnonId(id)
    setPassword(pass)
    handleLogin(id, pass)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)] flex items-center justify-center p-4 relative selection:bg-cyan-500/20 selection:text-cyan-300">
      <StarfieldSky />

      <div className="relative z-10 w-full max-w-xl animate-fade-in space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <LearnAILogo size="lg" withText={true} withTagline={true} />
          </div>
          <p className="mu text-xs max-w-md mx-auto">
            A universe of concepts where topics are stars, prerequisites are glowing links,
            and mastery ignites the constellation.
          </p>
        </div>

        {/* ─── SAMPLE QUICK LOGIN CARDS (Teacher & Student) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Teacher Portal Sample Card */}
          <div className="card p-5 border border-cyan-400/30 hover:border-cyan-400 transition-all bg-[var(--s1)] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="badge text-[10px]">Teacher Portal</span>
                <Telescope className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-base font-bold font-display text-[var(--tx)]">
                Class Observatory
              </h2>
              <p className="mu text-xs mt-1 leading-relaxed">
                View student growth graphs, class heatmaps, and AI assistance tasks.
              </p>
              <div className="mt-2.5 p-2 rounded-lg bg-[var(--s2)] font-mono text-[11px] text-[var(--tx)] border border-[var(--bd)]">
                ID: <span className="text-cyan-400 font-bold">T-001</span> · Pass: <span className="text-cyan-400">teach123</span>
              </div>
            </div>

            <button
              type="button"
              id="quick-login-teacher"
              disabled={loading}
              onClick={() => quickLogin('T-001', 'teach123')}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/25 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
            >
              <span>Enter Teacher Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Student Portal Sample Card */}
          <div className="card p-5 border border-amber-400/30 hover:border-amber-400 transition-all bg-[var(--s1)] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="chip text-[10px] text-amber-400 border-amber-400/30">Student Portal</span>
                <Compass className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-base font-bold font-display text-[var(--tx)]">
                My Universe
              </h2>
              <p className="mu text-xs mt-1 leading-relaxed">
                Step-by-step reading, recall quizzes, leveled games & interactive compiler.
              </p>
              <div className="mt-2.5 p-2 rounded-lg bg-[var(--s2)] font-mono text-[11px] text-[var(--tx)] border border-[var(--bd)]">
                ID: <span className="text-amber-400 font-bold">S-001</span> · Pass: <span className="text-amber-400">student123</span>
              </div>
            </div>

            <button
              type="button"
              id="quick-login-student"
              disabled={loading}
              onClick={() => quickLogin('S-001', 'student123')}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 hover:bg-amber-500/25 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
            >
              <span>Enter Student Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ─── MANUAL SIGN IN CARD ─── */}
        <div className="card p-6 sm:p-7 bg-[var(--s1)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-[var(--tx)]">
              Manual Account Sign In
            </h3>
            <span className="mu text-xs">Enter any sample ID</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--mu)] uppercase tracking-wider mb-1.5">
                Anonymous ID
              </label>
              <input
                id="anon-id-input"
                type="text"
                className="w-full py-2.5 px-3.5 rounded-xl bg-[var(--s2)] border border-[var(--bd)] text-[var(--tx)] text-sm outline-none focus:border-cyan-400 transition-all font-mono"
                placeholder="e.g. S-001, S-004, or T-001"
                value={anonId}
                onChange={(e) => setAnonId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--mu)] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'}
                  className="w-full py-2.5 px-3.5 pr-10 rounded-xl bg-[var(--s2)] border border-[var(--bd)] text-[var(--tx)] text-sm outline-none focus:border-cyan-400 transition-all font-mono"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mu)] hover:text-[var(--tx)] transition-colors min-h-[30px]"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 text-[#05070D] font-bold text-sm shadow-[0_0_15px_rgba(34,211,238,0.35)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              {loading ? (
                <span>Connecting to Universe…</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-xs text-[var(--mu)] pt-2 border-t border-[var(--bd)]">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Only anonymous IDs stored. No personal student names sent to the AI.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
