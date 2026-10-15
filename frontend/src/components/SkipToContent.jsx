import React from 'react'

export default function SkipToContent({ targetId = 'main-content' }) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
    >
      Skip to main content
    </a>
  )
}
