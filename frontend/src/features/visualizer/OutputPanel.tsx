import React from 'react'
import { Terminal, AlertCircle } from 'lucide-react'

interface OutputPanelProps {
  stdout?: string
  error?: { type: string; message: string; line?: number | null } | null
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ stdout = '', error }) => {
  return (
    <div className="flex flex-col h-full bg-surface-card rounded-2xl border border-surface-border p-4 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Output / Console</span>
        </h3>
        <span className="text-xs font-mono text-slate-500">{stdout.length} chars</span>
      </div>

      <div className="flex-1 overflow-y-auto pt-3 font-mono text-xs space-y-2">
        {stdout ? (
          <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed select-text font-mono">
            {stdout}
          </pre>
        ) : (
          <div className="text-slate-600 italic select-none">No console output yet</div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold text-red-200">
                {error.type} {error.line ? `(line ${error.line})` : ''}
              </div>
              <div className="text-red-300/90 font-mono whitespace-pre-wrap">
                {error.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default OutputPanel
