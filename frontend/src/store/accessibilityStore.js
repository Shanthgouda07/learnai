import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

const initialDark = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-color-scheme: dark)').matches
  : false

export const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      font: 'default', // 'default' | 'atkinson' | 'opendyslexic'
      textSize: 100, // 100 | 125 | 150 | 200
      lineSpacing: 'normal', // 'normal' | 'relaxed' | 'loose'
      letterSpacing: 'normal', // 'normal' | 'wide' | 'extra-wide'
      reducedMotion: initialReducedMotion,
      highContrast: false,
      theme: 'dark', // 'dark' (Mission Control default) | 'light' | 'system'
      simpleLanguage: false,
      drawerOpen: false,
      shortcutsDialogOpen: false,

      setFont: (font) => {
        set({ font })
        get().applySettings()
      },
      setTextSize: (textSize) => {
        set({ textSize })
        get().applySettings()
      },
      setLineSpacing: (lineSpacing) => {
        set({ lineSpacing })
        get().applySettings()
      },
      setLetterSpacing: (letterSpacing) => {
        set({ letterSpacing })
        get().applySettings()
      },
      setReducedMotion: (reducedMotion) => {
        set({ reducedMotion })
        get().applySettings()
      },
      setHighContrast: (highContrast) => {
        set({ highContrast })
        get().applySettings()
      },
      setTheme: (theme) => {
        set({ theme })
        get().applySettings()
      },
      toggleSimpleLanguage: () => {
        set((state) => ({ simpleLanguage: !state.simpleLanguage }))
      },
      toggleDrawer: () => {
        set((state) => ({ drawerOpen: !state.drawerOpen }))
      },
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      openShortcutsDialog: () => set({ shortcutsDialogOpen: true }),
      closeShortcutsDialog: () => set({ shortcutsDialogOpen: false }),

      resetAll: () => {
        set({
          font: 'default',
          textSize: 100,
          lineSpacing: 'normal',
          letterSpacing: 'normal',
          reducedMotion: initialReducedMotion,
          highContrast: false,
          theme: 'system',
          simpleLanguage: false,
        })
        get().applySettings()
      },

      applySettings: () => {
        if (typeof document === 'undefined') return
        const root = document.documentElement
        const { font, textSize, lineSpacing, letterSpacing, reducedMotion, highContrast, theme } = get()

        // 1. Font scale
        root.style.setProperty('--font-scale', `${textSize}%`)

        // 2. Line spacing
        const lineSpacingMap = { normal: '1.5', relaxed: '1.75', loose: '2.0' }
        root.style.setProperty('--line-spacing', lineSpacingMap[lineSpacing] || '1.5')

        // 3. Letter spacing
        const letterSpacingMap = { normal: 'normal', wide: '0.04em', 'extra-wide': '0.08em' }
        root.style.setProperty('--letter-spacing', letterSpacingMap[letterSpacing] || 'normal')

        // 4. Font family class
        root.classList.remove('font-atkinson', 'font-opendyslexic')
        if (font === 'atkinson') root.classList.add('font-atkinson')
        if (font === 'opendyslexic') root.classList.add('font-opendyslexic')

        // 5. Reduced Motion
        if (reducedMotion) {
          root.classList.add('reduced-motion')
        } else {
          root.classList.remove('reduced-motion')
        }

        // 6. High Contrast
        if (highContrast) {
          root.classList.add('high-contrast')
        } else {
          root.classList.remove('high-contrast')
        }

        // 7. Theme (Light, Dark, System)
        const isDark = theme === 'dark' || (theme === 'system' && (window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true))
        if (isDark) {
          root.classList.add('dark')
          root.classList.remove('light')
        } else {
          root.classList.remove('dark')
          root.classList.add('light')
        }
      },
    }),
    {
      name: 'learnai-a11y-settings',
      onRehydrateStorage: () => (state) => {
        if (state) state.applySettings()
      },
    }
  )
)
