import React from 'react'

/**
 * KnowledgeMap Component
 * Interactive SVG constellation knowledge map.
 * Shows topic stars, glowing prerequisite links, dashed lines for weak foundations,
 * hollow dashed circles for unexplored concepts, and ignite animations when unlocked.
 */

export const DEFAULT_NODES = {
  variables:    { x: 80,  y: 170, m: 0.35, label: 'Variables' },
  conditionals: { x: 210, y: 70,  m: 0.70, label: 'Conditionals' },
  loops:        { x: 320, y: 185, m: 0.30, label: 'Loops' },
  lists:        { x: 490, y: 95,  m: null, label: 'Lists' },
  functions:    { x: 490, y: 280, m: null, label: 'Functions' },
}

export const DEFAULT_LINKS = [
  ['variables', 'loops'],
  ['conditionals', 'loops'],
  ['loops', 'lists'],
  ['variables', 'functions'],
]

export const PREREQUISITES = {
  variables: [],
  conditionals: [],
  loops: ['variables', 'conditionals'],
  lists: ['loops'],
  functions: ['variables'],
}

const cap = (t) => t ? t[0].toUpperCase() + t.slice(1) : ''
const pc = (m) => m === null || m === undefined ? 'No data' : `${Math.round(m * 100)}%`

export default function KnowledgeMap({
  nodes = DEFAULT_NODES,
  links = DEFAULT_LINKS,
  selected = 'loops',
  unlocked = {},
  onSelectNode,
  className = '',
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <svg
        className="map"
        viewBox="0 0 580 330"
        role="group"
        aria-label="Interactive concept constellation knowledge map"
      >
        {/* Prerequisite Link Lines */}
        {links.map(([a, b]) => {
          const nodeA = nodes[a]
          const nodeB = nodes[b]
          if (!nodeA || !nodeB) return null

          const isWeak = Math.min(nodeA.m ?? 1, nodeB.m ?? 1) < 0.5
          return (
            <line
              key={`${a}-${b}`}
              x1={nodeA.x}
              y1={nodeA.y}
              x2={nodeB.x}
              y2={nodeB.y}
              style={{
                stroke: 'var(--ac)',
                strokeOpacity: isWeak ? 0.35 : 0.85,
              }}
              strokeWidth="2"
              strokeDasharray={isWeak ? '6 6' : undefined}
            />
          )
        })}

        {/* Concept Stars (Nodes) */}
        {Object.entries(nodes).map(([key, node]) => {
          const isSelected = key === selected
          const isUnlocked = Boolean(unlocked[key])
          const r = 16 + (node.m ?? 0.2) * 14

          return (
            <g
              key={key}
              tabIndex={0}
              role="button"
              data-k={key}
              aria-label={`${cap(key)}, mastery ${pc(node.m)}, games ${isUnlocked ? 'unlocked' : 'locked'}`}
              onClick={() => onSelectNode?.(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectNode?.(key)
                }
              }}
              className={`node ${isSelected ? 'sel' : ''} ${isUnlocked && isSelected ? 'ignite' : ''} focus:outline-none`}
            >
              {/* Unlock Ignition Pulse Wave */}
              <circle
                className="pulse"
                cx={node.x}
                cy={node.y}
                r="0"
                style={{ fill: 'none', stroke: 'var(--ac)' }}
              />

              {/* Selection Focus Ring */}
              <circle
                className="ring"
                cx={node.x}
                cy={node.y}
                r={r + 6}
                style={{ fill: 'none', stroke: 'transparent' }}
              />

              {/* Core Star Body */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                style={{
                  fill: node.m === null ? 'none' : `rgba(var(--ar), ${0.25 + 0.75 * node.m})`,
                  stroke: 'var(--ac)',
                  filter: `drop-shadow(0 0 ${(node.m || 0) * 12}px var(--ac))`,
                }}
                strokeWidth="2"
                strokeDasharray={node.m === null ? '4 4' : undefined}
              />

              {/* Star Text Label */}
              <text
                x={node.x}
                y={node.y + r + 20}
                textAnchor="middle"
                style={{ fill: 'var(--tx)', fontFamily: 'Inter, sans-serif' }}
                fontSize="13"
                fontWeight="500"
              >
                {cap(key)} · {pc(node.m)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Accessible List View Alternative */}
      <div className="hud" role="group" aria-label="Accessible topic list navigation">
        {Object.entries(nodes).map(([key, node]) => (
          <button
            key={key}
            type="button"
            data-k={key}
            aria-pressed={key === selected}
            onClick={() => onSelectNode?.(key)}
            className="text-xs"
          >
            {cap(key)} · {pc(node.m)}
          </button>
        ))}
      </div>
    </div>
  )
}
