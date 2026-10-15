import React from 'react'

/**
 * MasteryStar Component for LearnAI Learning Universe
 *
 * Mastery scale:
 * - no_data: Hollow / hatched star (never zero or negative)
 * - low: Dim indigo (weak foundation, shows why downstream concepts struggle)
 * - medium: Electric teal (developing practice)
 * - high / mastered: Bright white-cyan with radiant stellar flare
 *
 * Colorblind-safe: paired with geometric pattern, rings, and textual status.
 */
export default function MasteryStar({
  score = null,          // 0 to 100 or null
  status = null,         // 'no_data' | 'low' | 'medium' | 'high'
  size = 'md',           // 'sm' | 'md' | 'lg' | 'xl'
  label = '',            // Concept title (e.g. "Variables", "Loops")
  orbitCount = 0,        // Number of orbiting game mini-dots (0 to 3)
  interactive = false,   // Accessible button with hover glow
  pulse = false,         // Active link pulse or unlock animation
  showLabel = true,
  onClick,
  className = '',
  id,
}) {
  // Determine computed status based on score or explicit status
  const getComputedStatus = () => {
    if (status) return status
    if (score === null || score === undefined) return 'no_data'
    if (score < 40) return 'low'
    if (score < 75) return 'medium'
    return 'high'
  }

  const currentStatus = getComputedStatus()

  const sizeConfig = {
    sm: { svgSize: 32, starR: 5, outerR: 12, text: 'text-[11px]', labelGap: 'mt-1' },
    md: { svgSize: 48, starR: 7, outerR: 18, text: 'text-xs', labelGap: 'mt-1.5' },
    lg: { svgSize: 64, starR: 10, outerR: 24, text: 'text-sm', labelGap: 'mt-2' },
    xl: { svgSize: 84, starR: 14, outerR: 32, text: 'text-base', labelGap: 'mt-2.5' },
  }

  const config = sizeConfig[size] || sizeConfig.md

  // Status visual attributes
  const statusConfig = {
    no_data: {
      label: 'Unexplored',
      colorText: 'text-slate-400',
      coreColor: 'none',
      strokeColor: '#64748B',
      haloColor: 'transparent',
      glowShadow: 'none',
      borderStyle: 'stroke-dasharray="3,3"',
      pattern: true,
    },
    low: {
      label: 'Dim Foundation',
      colorText: 'text-indigo-400',
      coreColor: '#3730A3',
      strokeColor: '#4F46E5',
      haloColor: 'rgba(67, 56, 202, 0.25)',
      glowShadow: '0 0 12px rgba(79, 70, 229, 0.4)',
      pattern: false,
    },
    medium: {
      label: 'Developing',
      colorText: 'text-cyan-400',
      coreColor: '#0891B2',
      strokeColor: '#06B6D4',
      haloColor: 'rgba(6, 182, 212, 0.3)',
      glowShadow: '0 0 18px rgba(34, 211, 238, 0.5)',
      pattern: false,
    },
    high: {
      label: 'Mastered Star',
      colorText: 'text-white',
      coreColor: '#FFFFFF',
      strokeColor: '#22D3EE',
      haloColor: 'rgba(34, 211, 238, 0.55)',
      glowShadow: '0 0 25px rgba(34, 211, 238, 0.85)',
      flare: true,
      pattern: false,
    },
  }

  const s = statusConfig[currentStatus] || statusConfig.no_data

  const center = config.svgSize / 2

  return (
    <div
      id={id}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.(e)
              }
            }
          : undefined
      }
      className={`inline-flex flex-col items-center select-none transition-all duration-200 ${
        interactive
          ? 'cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070D] rounded-2xl p-1'
          : ''
      } ${className}`}
      title={`${label ? `${label}: ` : ''}${s.label}${score !== null ? ` (${Math.round(score)}%)` : ''}`}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: config.svgSize, height: config.svgSize }}
      >
        <svg
          viewBox={`0 0 ${config.svgSize} ${config.svgSize}`}
          className={`w-full h-full overflow-visible ${pulse ? 'animate-pulse' : ''}`}
        >
          <defs>
            {/* Hatching Pattern for 'No Data' */}
            <pattern
              id={`hatchPattern-${config.svgSize}`}
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="4" stroke="#64748B" strokeWidth="1" opacity="0.6" />
            </pattern>

            {/* Radiant Flare Gradient */}
            <radialGradient id={`starHalo-${currentStatus}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={s.strokeColor} stopOpacity="0.8" />
              <stop offset="50%" stopColor={s.haloColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={s.haloColor} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Outer Halo Diffusion */}
          {currentStatus !== 'no_data' && (
            <circle
              cx={center}
              cy={center}
              r={config.outerR}
              fill={`url(#starHalo-${currentStatus})`}
            />
          )}

          {/* 2. Concentric Orbit Guide Ring */}
          <circle
            cx={center}
            cy={center}
            r={config.outerR - 2}
            fill="none"
            stroke={currentStatus === 'no_data' ? '#475569' : s.strokeColor}
            strokeWidth={currentStatus === 'high' ? '1.5' : '1'}
            strokeOpacity={currentStatus === 'no_data' ? '0.4' : '0.3'}
            strokeDasharray={currentStatus === 'no_data' ? '3,3' : 'none'}
          />

          {/* 3. High Mastery Diamond Cross Flares */}
          {s.flare && (
            <g stroke="#FFFFFF" strokeWidth="1.2" opacity="0.9">
              <line x1={center} y1={center - config.starR - 6} x2={center} y2={center + config.starR + 6} />
              <line x1={center - config.starR - 6} y1={center} x2={center + config.starR + 6} y2={center} />
            </g>
          )}

          {/* 4. Core Star Celestial Body */}
          {currentStatus === 'no_data' ? (
            <circle
              cx={center}
              cy={center}
              r={config.starR}
              fill={`url(#hatchPattern-${config.svgSize})`}
              stroke="#64748B"
              strokeWidth="1.5"
            />
          ) : (
            <circle
              cx={center}
              cy={center}
              r={config.starR}
              fill={s.coreColor}
              stroke={s.strokeColor}
              strokeWidth={currentStatus === 'high' ? '2' : '1.5'}
              style={{ filter: `drop-shadow(${s.glowShadow})` }}
            />
          )}

          {/* 5. Orbiting Game Mini-dots */}
          {orbitCount > 0 && (
            <>
              <circle
                cx={center + (config.outerR - 2) * Math.cos(0.8)}
                cy={center + (config.outerR - 2) * Math.sin(0.8)}
                r="2"
                fill="#F59E0B"
                className="animate-pulse"
              />
              {orbitCount > 1 && (
                <circle
                  cx={center + (config.outerR - 2) * Math.cos(2.8)}
                  cy={center + (config.outerR - 2) * Math.sin(2.8)}
                  r="2"
                  fill="#22D3EE"
                />
              )}
            </>
          )}
        </svg>
      </div>

      {/* Label & Status */}
      {showLabel && label && (
        <div className={`text-center ${config.labelGap}`}>
          <div className={`font-semibold font-display tracking-tight text-[var(--color-ink)] ${config.text}`}>
            {label}
          </div>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className={`text-[10px] font-mono ${s.colorText}`}>
              {score !== null ? `${Math.round(score)}%` : s.label}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
