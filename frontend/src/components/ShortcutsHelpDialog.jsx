import React, { useEffect } from 'react'
import { X, Keyboard, Command } from 'lucide-react'
import { useAccessibilityStore } from '../store/accessibilityStore'

export default function ShortcutsHelpDialog() {
  const { shortcutsDialogOpen, closeShortcutsDialog, openShortcutsDialog, toggleDrawer } = useAccessibilityStore()

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input, textarea or contenteditable
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) {
        return
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        if (shortcutsDialogOpen) {
          closeShortcutsDialog()
        } else {
          openShortcutsDialog()
        }
      } else if (e.key === 'Escape') {
        closeShortcutsDialog()
      } else if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        toggleDrawer()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcutsDialogOpen, closeShortcutsDialog, openShortcutsDialog, toggleDrawer])

  if (!shortcutsDialogOpen) return null

  const shortcuts = [
    { key: '?', desc: 'Open this keyboard shortcuts dialog' },
    { key: 'Alt + A', desc: 'Toggle accessibility settings drawer' },
    { key: 'Tab', desc: 'Navigate to next interactive element' },
    { key: 'Shift + Tab', desc: 'Navigate to previous interactive element' },
    { key: 'Enter / Space', desc: 'Activate selected button, link, or game item' },
    { key: 'Arrow Keys', desc: 'Navigate steps, slider options, or quiz answers' },
    { key: 'Esc', desc: 'Close open dialogs or drawers' },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={closeShortcutsDialog}
    >
      <div
        className="w-full max-w-lg notebook-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[var(--color-teal)]" aria-hidden="true" />
            <h2 id="shortcuts-title" className="text-xl font-bold text-[var(--color-ink)]">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={closeShortcutsDialog}
            aria-label="Close shortcuts dialog"
            className="p-2 rounded-lg hover:bg-[var(--color-border-subtle)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[var(--color-ink-muted)] mt-2 mb-4">
          LearnAI is fully operable with a keyboard. No mouse is required for games, charts, or notes.
        </p>

        <div className="space-y-2.5">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-muted)]"
            >
              <span className="text-sm text-[var(--color-ink)]">{sc.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-[var(--color-bg)] text-[var(--color-ink)] border border-[var(--color-border)] rounded-md shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-end">
          <button
            onClick={closeShortcutsDialog}
            className="notebook-btn-primary text-xs py-2 px-5"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
