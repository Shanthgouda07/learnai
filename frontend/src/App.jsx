import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useAccessibilityStore } from './store/accessibilityStore'
import api from './services/api'

import LoginPage from './pages/LoginPage'
import TeacherLayout from './pages/teacher/TeacherLayout'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherNotes from './pages/teacher/TeacherNotes'
import TeacherGames from './pages/teacher/TeacherGames'
import DeskLayout from './features/desk/DeskLayout'
import TeacherAIActivity from './pages/teacher/TeacherAIActivity'
import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentNotes from './pages/student/StudentNotes'
import NoteReader from './pages/student/NoteReader'
import GameLibrary from './features/games/GameLibrary'
import GamePlayer from './features/games/GamePlayer'
import VisualizerPage from './features/visualizer/VisualizerPage'

import ConsentScreen from './features/privacy/ConsentScreen'
import PrivacyCenter from './features/privacy/PrivacyCenter'
import ComponentPreview from './pages/ComponentPreview'
import AccessibilityDrawer from './components/AccessibilityDrawer'
import ShortcutsHelpDialog from './components/ShortcutsHelpDialog'
import SkipToContent from './components/SkipToContent'
import DemoBanner from './components/DemoBanner'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'

function RequireAuth({ children, role }) {
  const { isAuthenticated, user } = useAuthStore()
  const [consentChecked, setConsentChecked] = useState(false)
  const [hasConsented, setHasConsented] = useState(true)

  const verifyConsent = () => {
    if (isAuthenticated && user?.role === 'student') {
      api.get('/consent')
        .then((res) => {
          setHasConsented(Boolean(res.data?.has_consented))
          setConsentChecked(true)
        })
        .catch(() => {
          setConsentChecked(true)
        })
    } else {
      setConsentChecked(true)
    }
  }

  useEffect(() => {
    verifyConsent()

    const handleConsentRequired = () => {
      setHasConsented(false)
    }
    window.addEventListener('learnai-consent-required', handleConsentRequired)
    return () => window.removeEventListener('learnai-consent-required', handleConsentRequired)
  }, [isAuthenticated, user])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/login" replace />

  if (user?.role === 'student') {
    if (!consentChecked) {
      return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-teal)] border-t-transparent animate-spin" />
        </div>
      )
    }
    if (!hasConsented) {
      return <ConsentScreen onConsented={() => setHasConsented(true)} />
    }
  }

  return children
}

export default function App() {
  const location = useLocation()
  const { applySettings } = useAccessibilityStore()

  // Apply accessibility settings on initial render
  useEffect(() => {
    applySettings()
  }, [])

  // Update page title per route
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/desk')) {
      document.title = 'Teacher AI Desk | LearnAI'
    } else if (path.includes('/teacher')) {
      document.title = 'Teacher Studio | LearnAI'
    } else if (path.includes('/student/notes')) {
      document.title = 'Notebook & Notes | LearnAI'
    } else if (path.includes('/student/games') || path.includes('/games')) {
      document.title = 'Practice Games | LearnAI'
    } else if (path.includes('/student')) {
      document.title = 'Learning Path | LearnAI'
    } else if (path.includes('/privacy')) {
      document.title = 'Privacy & Ethics Center | LearnAI'
    } else if (path.includes('/visualizer')) {
      document.title = 'Execution Visualizer | LearnAI'
    } else {
      document.title = 'LearnAI – Calm Studio Notebook'
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-ink)] selection:bg-[var(--color-teal-wash)] selection:text-[var(--color-teal)]">
      <SkipToContent targetId="main-content" />
      <DemoBanner />

      <main id="main-content" className="flex-1 flex flex-col focus:outline-none">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/preview" element={<ComponentPreview />} />
          <Route path="/visualizer" element={<VisualizerPage />} />
          <Route path="/privacy" element={<PrivacyCenter />} />

          {/* Teacher routes */}
          <Route path="/teacher" element={
            <RequireAuth role="teacher"><TeacherLayout /></RequireAuth>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="notes"    element={<TeacherNotes />} />
            <Route path="games"    element={<TeacherGames />} />
            <Route path="activity" element={<TeacherAIActivity />} />
            <Route path="desk"     element={<DeskLayout />} />
          </Route>

          {/* Student routes */}
          <Route path="/student" element={
            <RequireAuth role="student"><StudentLayout /></RequireAuth>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="notes"         element={<StudentNotes />} />
            <Route path="notes/:noteId" element={<NoteReader />} />
            <Route path="games"         element={<GameLibrary />} />
            <Route path="games/:id"     element={<GamePlayer />} />
          </Route>

          {/* Standalone /games routes */}
          <Route path="/games" element={
            <RequireAuth role="student"><StudentLayout /></RequireAuth>
          }>
            <Route index element={<GameLibrary />} />
            <Route path=":id" element={<GamePlayer />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      <Footer />
      <AccessibilityDrawer />
      <ShortcutsHelpDialog />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'mission-toast',
        }}
      />
    </div>
  )
}
