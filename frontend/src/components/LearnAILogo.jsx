import React from 'react'

/**
 * LearnAI Constellation Logo Component
 * A delicate constellation of stars forming an "L" for LearnAI,
 * connected with luminous quantum link lines.
 */
export default function LearnAILogo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  withText = true,
  withTagline = false,
  className = '',
}) {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-sm', tagline: 'text-[9px]', starR: 1.8 },
    md: { box: 'w-9 h-9', text: 'text-base', tagline: 'text-[10px]', starR: 2.2 },
    lg: { box: 'w-12 h-12', text: 'text-xl', tagline: 'text-xs', starR: 2.6 },
    xl: { box: 'w-16 h-16', text: 'text-2xl', tagline: 'text-sm', starR: 3.2 },
  }

  const currentSize = sizeMap[size] || sizeMap.md

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Constellation 'L' SVG Icon */}
      <div
        className={`${currentSize.box} relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-[#0B1020] to-[#121933] border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.25)] p-1`}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Luminous Glow Filter */}
            <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Cyan Gradient for Lines */}
            <linearGradient id="linkGradient" x1="12" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22D3EE" stopOpacity="0.85" />
              <stop offset="0.6" stopColor="#06B6D4" stopOpacity="0.7" />
              <stop offset="1" stopColor="#38BDF8" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Background constellation faint guide lines */}
          <line x1="12" y1="8" x2="26" y2="20" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="0.8" strokeDasharray="2 2" />
          <line x1="26" y1="20" x2="32" y2="32" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="0.8" strokeDasharray="2 2" />

          {/* Constellation Primary 'L' Links */}
          <polyline
            points="12,8 12,32 32,32"
            stroke="url(#linkGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Secondary support star anchor at middle elbow */}
          <circle cx="26" cy="20" r="1.4" fill="#94A3B8" opacity="0.6" />

          {/* Glowing Constellation Stars */}
          {/* Top of L */}
          <circle cx="12" cy="8" r="4" fill="rgba(34,211,238,0.3)" />
          <circle cx="12" cy="8" r={currentSize.starR} fill="#FFFFFF" filter="url(#starGlow)" />

          {/* Upper Vertical */}
          <circle cx="12" cy="16" r="1.6" fill="#A5F3FC" filter="url(#starGlow)" />

          {/* Lower Vertical */}
          <circle cx="12" cy="24" r="1.6" fill="#A5F3FC" filter="url(#starGlow)" />

          {/* Corner Node (Major star) */}
          <circle cx="12" cy="32" r="4.5" fill="rgba(34,211,238,0.35)" />
          <circle cx="12" cy="32" r={currentSize.starR + 0.4} fill="#FFFFFF" filter="url(#starGlow)" />

          {/* Horizontal Mid */}
          <circle cx="22" cy="32" r="1.6" fill="#A5F3FC" filter="url(#starGlow)" />

          {/* Horizontal End (Major star) */}
          <circle cx="32" cy="32" r="4" fill="rgba(34,211,238,0.3)" />
          <circle cx="32" cy="32" r={currentSize.starR} fill="#FFFFFF" filter="url(#starGlow)" />
        </svg>
      </div>

      {/* Brand Wordmark & Tagline */}
      {withText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-display font-extrabold tracking-tight text-[var(--color-ink)] ${currentSize.text}`}>
              Learn<span className="text-cyan-400">AI</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22D3EE]" />
          </div>
          {withTagline ? (
            <span className={`text-[var(--color-ink-muted)] font-medium tracking-wide mt-1 ${currentSize.tagline}`}>
              Read it. Play it. Master it.
            </span>
          ) : (
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/90 mt-0.5">
              Learning Universe
            </span>
          )}
        </div>
      )}
    </div>
  )
}
