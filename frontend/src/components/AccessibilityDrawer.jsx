import React from 'react'
import {
  X, Type, Eye, Sun, Moon, Monitor, RefreshCw,
  Sparkles, Check, ZoomIn, Sliders
} from 'lucide-react'
import { useAccessibilityStore } from '../store/accessibilityStore'

export default function AccessibilityDrawer() {
  const {
    drawerOpen,
    closeDrawer,
    font,
    setFont,
    textSize,
    setTextSize,
    lineSpacing,
    setLineSpacing,
    letterSpacing,
    setLetterSpacing,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    theme,
    setTheme,
    simpleLanguage,
    toggleSimpleLanguage,
    resetAll,
  } = useAccessibilityStore()

  if (!drawerOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={closeDrawer}
    >
      <div
        className="w-full max-w-md h-full overflow-y-auto notebook-card border-l rounded-none p-6 shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[var(--color-teal)]" aria-hidden="true" />
              <h2 id="a11y-title" className="text-xl font-bold text-[var(--color-ink)]">
                Accessibility & View
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              aria-label="Close accessibility settings"
              className="p-2 rounded-lg hover:bg-[var(--color-border-subtle)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] touch-target flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[var(--color-ink-muted)] mt-2 mb-6">
            Customize typography, contrast, and layout for comfortable reading. All settings are saved automatically.
          </p>

          <div className="space-y-6">
            {/* 1. Theme Selection */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Warm Light', icon: Sun },
                  { id: 'dark', label: 'Warm Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      theme === id
                        ? 'border-[var(--color-teal)] bg-[var(--color-teal-wash)] text-[var(--color-teal)] font-bold'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] text-[var(--color-ink)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Reading Font */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
                Reading Font
              </label>
              <div className="space-y-2">
                {[
                  { id: 'default', label: 'Inter (Default)', desc: 'Clean modern sans-serif' },
                  { id: 'atkinson', label: 'Atkinson Hyperlegible', desc: 'Designed with Braille Institute for low vision' },
                  { id: 'opendyslexic', label: 'Dyslexia Friendly', desc: 'Weighted bases to prevent letter confusion' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFont(f.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      font === f.id
                        ? 'border-[var(--color-teal)] bg-[var(--color-teal-wash)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-border-subtle)]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-[var(--color-ink)]">{f.label}</div>
                      <div className="text-xs text-[var(--color-ink-muted)]">{f.desc}</div>
                    </div>
                    {font === f.id && <Check className="w-4 h-4 text-[var(--color-teal)]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Text Size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
                  Text Size
                </label>
                <span className="text-xs font-bold text-[var(--color-teal)]">{textSize}%</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[100, 125, 150, 200].map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                      textSize === size
                        ? 'border-[var(--color-teal)] bg-[var(--color-teal-wash)] text-[var(--color-teal)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] text-[var(--color-ink)]'
                    }`}
                  >
                    {size}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-1.5">
                Layouts adapt gracefully at 200% without horizontal scroll or broken text.
              </p>
            </div>

            {/* 4. Spacing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
                  Line Height
                </label>
                <select
                  value={lineSpacing}
                  onChange={(e) => setLineSpacing(e.target.value)}
                  className="w-full notebook-input text-xs"
                >
                  <option value="normal">Normal (1.5x)</option>
                  <option value="relaxed">Relaxed (1.75x)</option>
                  <option value="loose">Loose (2.0x)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2">
                  Letter Spacing
                </label>
                <select
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(e.target.value)}
                  className="w-full notebook-input text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="wide">Wide</option>
                  <option value="extra-wide">Extra Wide</option>
                </select>
              </div>
            </div>

            {/* 5. Accessibility Toggles */}
            <div className="space-y-3 pt-2">
              {/* High Contrast */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-[var(--color-ink)]">High Contrast</div>
                  <div className="text-xs text-[var(--color-ink-muted)]">Pure high-contrast borders and maximal readability</div>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-teal)]"
                />
              </label>

              {/* Reduced Motion */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-[var(--color-ink)]">Reduced Motion</div>
                  <div className="text-xs text-[var(--color-ink-muted)]">Disables all non-essential animations and transitions</div>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="w-4 h-4 accent-[var(--color-teal)]"
                />
              </label>

              {/* Simple Language */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] cursor-pointer">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[var(--color-ink)]">Simple Language Mode</span>
                    <span className="badge-ai text-[10px]">AI</span>
                  </div>
                  <div className="text-xs text-[var(--color-ink-muted)]">Displays simplified note explanations for clearer reading</div>
                </div>
                <input
                  type="checkbox"
                  checked={simpleLanguage}
                  onChange={toggleSimpleLanguage}
                  className="w-4 h-4 accent-[var(--color-teal)]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Reset Button */}
        <div className="pt-6 border-t border-[var(--color-border)] flex justify-between items-center">
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors py-2 px-3 rounded-lg hover:bg-[var(--color-border-subtle)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset all defaults
          </button>
          <button
            onClick={closeDrawer}
            className="notebook-btn-primary text-xs py-2 px-4"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
