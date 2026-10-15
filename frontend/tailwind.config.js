/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        atkinson: ['"Atkinson Hyperlegible"', 'sans-serif'],
        dyslexic: ['"OpenDyslexic"', 'cursive'],
      },
      colors: {
        space: {
          bg: '#05070D',
          surface1: '#0B1020',
          surface2: '#121933',
          surface3: '#1B2446',
          hover: '#182245',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-subtle': 'rgba(255, 255, 255, 0.04)',
        },
        cyan: {
          glow: '#00F0FF',
          hover: '#38BDF8',
          wash: 'rgba(0, 240, 255, 0.12)',
        },
        amber: {
          telemetry: '#F59E0B',
          glow: '#FBBF24',
          wash: 'rgba(245, 158, 11, 0.14)',
        },
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#00F0FF',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        surface: {
          DEFAULT: 'var(--color-bg)',
          card:    'var(--color-card)',
          border:  'var(--color-border)',
          hover:   'var(--color-surface-hover)',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 240, 255, 0.35)',
        'glow-amber': '0 0 25px rgba(245, 158, 11, 0.35)',
        'panel': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
}
