import React, { useEffect, useRef } from 'react'

/**
 * StarfieldSky Component
 * Renders the lightweight canvas starfield with 80 smooth twinkling stars.
 * Pauses on hidden tabs or when reduced motion is preferred.
 */
export default function StarfieldSky() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = null
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let stars = []

    const init = () => {
      if (rafId) cancelAnimationFrame(rafId)
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() + 0.3,
        p: Math.random() * 6,
      }))
      frame(0)
    }

    const frame = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#FFFFFF'

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        ctx.globalAlpha = 0.2 + 0.5 * Math.abs(Math.sin(s.p + time / 1800))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, 6.283)
        ctx.fill()
      }

      if (!prefersReducedMotion && !document.hidden) {
        rafId = requestAnimationFrame(frame)
      }
    }

    init()

    const handleResize = () => init()
    const handleVisibility = () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (!document.hidden && !prefersReducedMotion) {
        rafId = requestAnimationFrame(frame)
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return <canvas id="sky" ref={canvasRef} aria-hidden="true" />
}
