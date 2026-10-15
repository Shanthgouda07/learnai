import React, { useRef, useEffect } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'

interface CodeEditorProps {
  code: string
  onChange?: (val: string) => void
  readOnly?: boolean
  currentLine?: number | null
  isError?: boolean
  errorLine?: number | null
  height?: string | number
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  readOnly = false,
  currentLine,
  isError = false,
  errorLine,
  height = '100%',
}) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const decorationsRef = useRef<string[]>([])

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
  }

  // Update line decorations whenever currentLine or isError changes
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    const newDecorations = []
    if (currentLine && currentLine > 0) {
      const isErrLine = isError && errorLine === currentLine
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: isErrLine ? 'cv-line-highlight-error' : 'cv-line-highlight-teal',
          glyphMarginClassName: isErrLine ? 'cv-gutter-error' : 'cv-gutter-arrow',
        },
      })

      // Smoothly reveal current line in viewport
      editor.revealLineInCenterIfOutsideViewport(currentLine)
    }

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    )
  }, [currentLine, isError, errorLine])

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-surface-border bg-[#1e1e1e]">
      <Editor
        height={height}
        language="python"
        theme="vs-dark"
        value={code}
        onChange={val => onChange && onChange(val || '')}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineNumbers: 'on',
          glyphMargin: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          cursorBlinking: 'smooth',
          renderLineHighlight: 'none', // We manage the active line highlight ourselves
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  )
}
export default CodeEditor
