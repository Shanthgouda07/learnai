/**
 * LearnAI "Learning Universe" Design Tokens
 * Cinematic dark universe aesthetic with clean aerospace light variant.
 */
export const tokens = {
  colors: {
    // Learning Universe Dark (Default)
    dark: {
      bg: '#05070D',              // Deep ink navy universe base
      surface1: '#0B1020',        // Base concept cards & hull
      surface2: '#121933',        // Elevated observatory panels
      surface3: '#1B2446',        // Active popovers & focused cards
      surfaceHover: '#182245',    // Subtle stellar wash
      border: 'rgba(255, 255, 255, 0.08)',       // 1px low-opacity white boundary
      borderGlow: 'rgba(34, 211, 238, 0.4)',     // Electric cyan orbit glow
      borderSubtle: 'rgba(255, 255, 255, 0.04)',
      
      text: '#EEF1F8',            // Crisp off-white primary text
      textMuted: '#9AA4BF',       // Soft slate secondary text
      textSubtle: '#64748B',      // Inactive / faint metadata
      
      // Luminous Knowledge & Mastery Accents (#22D3EE family)
      cyan: '#22D3EE',            // Electric teal-cyan primary mastery beacon
      cyanHover: '#38BDF8',       // Ion glow hover
      cyanWash: 'rgba(34, 211, 238, 0.12)',
      cyanGlow: 'rgba(34, 211, 238, 0.45)',
      
      // Warm Highlight (XP, Streaks & Constellation Stars only)
      amber: '#F59E0B',           // Stellar amber highlight
      amberHover: '#FBBF24',
      amberWash: 'rgba(245, 158, 11, 0.14)',
      amberGlow: 'rgba(245, 158, 11, 0.35)',
      
      // Supportive State (Never harsh red)
      supportCoral: '#FB7185',    // Soft coral for "may need support"
      supportCoralWash: 'rgba(251, 113, 133, 0.14)',
      
      // Mastery Scale for Stars & Heatmaps
      masteryScale: {
        noData: '#64748B',        // Hatched / hollow star (never zero)
        low: '#3730A3',           // Dim indigo (weak foundation)
        medium: '#06B6D4',        // Developing teal
        high: '#22D3EE',          // Luminous cyan
        mastered: '#FFFFFF',      // Radiant white-cyan supernova
      },

      // Colorblind-Safe Semantic Statuses
      success: '#10B981',         // Mastered verified / emerald
      successWash: 'rgba(16, 185, 129, 0.14)',
      warning: '#F59E0B',         // Telemetry attention / amber
      warningWash: 'rgba(245, 158, 11, 0.14)',
      danger: '#FB7185',          // Soft coral (support needed)
      dangerWash: 'rgba(251, 113, 133, 0.14)',
      info: '#22D3EE',
      infoWash: 'rgba(34, 211, 238, 0.12)',
    },

    // Clean Aerospace Light Variant (for projectors & accessibility)
    light: {
      bg: '#F4F6FB',              // Crisp aerospace off-white
      surface1: '#FFFFFF',        // Clean white command deck
      surface2: '#EAEFF8',        // Elevated panel surface
      surface3: '#DDE5F4',        // Deepened interactive surface
      surfaceHover: '#F1F4FA',
      border: '#D5DDEB',          // 1px legible boundary
      borderGlow: '#0284C7',
      borderSubtle: '#E2E8F0',
      
      text: '#0B1020',            // Deep ink navy primary
      textMuted: '#475569',       // Legible slate secondary
      textSubtle: '#64748B',
      
      cyan: '#0284C7',            // Calibrated high-contrast cyan-blue
      cyanHover: '#0369A1',
      cyanWash: '#E0F2FE',
      cyanGlow: 'rgba(2, 132, 199, 0.25)',
      
      amber: '#D97706',           // Warm amber for points/streaks
      amberHover: '#B45309',
      amberWash: '#FEF3C7',
      amberGlow: 'rgba(217, 119, 6, 0.25)',
      
      supportCoral: '#E11D48',
      supportCoralWash: '#FFE4E6',
      
      masteryScale: {
        noData: '#94A3B8',
        low: '#4338CA',
        medium: '#0284C7',
        high: '#0369A1',
        mastered: '#0F172A',
      },

      success: '#059669',
      successWash: '#D1FAE5',
      warning: '#D97706',
      warningWash: '#FEF3C7',
      danger: '#E11D48',
      dangerWash: '#FFE4E6',
      info: '#0284C7',
      infoWash: '#E0F2FE',
    },
  },

  typography: {
    fontFamily: {
      display: '"Space Grotesk", "Sora", system-ui, sans-serif',
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", monospace',
      atkinson: '"Atkinson Hyperlegible", sans-serif',
      dyslexic: '"OpenDyslexic", "Comic Sans MS", cursive',
    },
    scale: {
      100: '100%',
      125: '125%',
      150: '150%',
      200: '200%',
    },
  },

  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },

  shadows: {
    card: '0 4px 24px -2px rgba(5, 7, 13, 0.65)',
    glowCyan: '0 0 25px rgba(34, 211, 238, 0.35)',
    glowAmber: '0 0 25px rgba(245, 158, 11, 0.35)',
    glowIndigo: '0 0 20px rgba(55, 48, 163, 0.4)',
    elevated: '0 20px 40px -10px rgba(0, 0, 0, 0.75)',
  },

  motion: {
    durationFast: '150ms',
    durationNormal: '250ms',
    durationSlow: '400ms',
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
}
