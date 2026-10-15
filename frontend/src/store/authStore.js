/**
 * Zustand store for auth state.
 * Persists token and user info in localStorage.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,   // { user_id, role, anon_id, name }
      isAuthenticated: false,

      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('learnai-auth')
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    { name: 'learnai-auth' }
  )
)
