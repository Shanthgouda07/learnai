import React, { useEffect, useState } from 'react'
import {
  Gamepad2, Plus, Sparkles, X, Check, Eye, Trash2, CheckCircle2,
  AlertCircle, Wrench, Bug, GripVertical, Code2, User
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  fill_blank:      { label: 'Fill the Blank', color: 'badge-brand', emoji: '✏️' },
  bug_hunt:        { label: 'Bug Hunt',        color: 'badge-red',   emoji: '🐛' },
  order_steps:     { label: 'Order Steps',     color: 'badge-amber', emoji: '📋' },
  visualizer:      { label: 'Code Visualizer', color: 'badge-green', emoji: '⚡' },
  code_visualizer: { label: 'Code Visualizer', color: 'badge-green', emoji: '⚡' },
}

export default function TeacherGames() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  // Form State
  const [selectedType, setSelectedType] = useState<'fill_blank' | 'bug_hunt' | 'order_steps' | 'visualizer'>('fill_blank')
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('loops')
  const [prompt, setPrompt] = useState('')
  const [difficulty, setDifficulty] = useState(1)
  const [targetStudent, setTargetStudent] = useState('')

  // Template-specific form fields
  // Fill Blank
  const [codeTemplate, setCodeTemplate] = useState('for i in range(___0___):\n    print(i)')
  const [blanksJson, setBlanksJson] = useState('[\n  {"id": 0, "options": ["5", "10", "i"], "answer": "5"}\n]')

  // Bug Hunt
  const [bugCode, setBugCode] = useState('total = 0\nfor i in range(5):\n    total =+ i\nprint(total)')
  const [bugLine, setBugLine] = useState(3)
  const [bugExplanation, setBugExplanation] = useState('Use += instead of =+')
  const [fixOptionsText, setFixOptionsText] = useState('total += i\ntotal = total - i\ntotal == i')
  const [correctFixIndex, setCorrectFixIndex] = useState(0)

  // Order Steps
  const [stepsText, setStepsText] = useState('x = 10\ny = 20\nprint(x + y)')

  // Visualizer
  const [starterCode, setStarterCode] = useState('total = 0\nfor i in range(1, 6):\n    total += i\nprint(total)')
  const [expectedOutput, setExpectedOutput] = useState('15')

  const [saving, setSaving] = useState(false)
  const [aiSources, setAiSources] = useState<any[]>([])
  const [generatingAi, setGeneratingAi] = useState(false)

  const fetchGames = () => {
    setLoading(true)
    api.get('/games/?class_id=1')
       .then(r => setGames(r.data))
       .catch(console.error)
       .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGames()
  }, [])

  // AI Generation from Note (via pipeline.run_ai)
  const handleGenerateFromNote = async () => {
    setGeneratingAi(true)
    try {
      const res = await api.post(`/games/generate-ai?game_type=${selectedType}&topic=${topic}&class_id=1`)
      const data = res.data
      setAiSources(data.sources || [])
      const content = data.content || {}

      setTitle(data.title || `AI Draft: ${topic.capitalize()} Challenge`)
      setPrompt(content.prompt || 'Solve the code challenge below.')

      if (selectedType === 'fill_blank') {
        setCodeTemplate(content.code_template || 'for i in range(___0___):\n    print(i)')
        setBlanksJson(JSON.stringify(content.blanks || [], null, 2))
      } else if (selectedType === 'bug_hunt') {
        setBugCode(content.code || 'for i in range(5):\n    print(i)')
        setBugLine(content.bug_line || 1)
        setBugExplanation(content.bug_explanation || 'Fix the loop statement.')
        setFixOptionsText((content.fix_options || []).join('\n'))
        setCorrectFixIndex(content.correct_fix_index || 0)
      } else if (selectedType === 'order_steps') {
        setStepsText((content.steps || []).join('\n'))
      } else {
        setStarterCode(content.starter_code || 'print("Hello")')
        setExpectedOutput(content.expected_output || 'Hello')
      }
      toast.success('Generated AI draft challenge!')
    } catch {
      toast.error('Failed to generate challenge from notes.')
    } finally {
      setGeneratingAi(false)
    }
  }

  // Validate and Save
  const handleSaveChallenge = async (status = 'draft') => {
    if (!title.trim() || !prompt.trim()) {
      toast.error('Title and prompt are required.')
      return
    }

    let contentObj: any = {
      prompt,
      topic,
      difficulty,
      points: 100,
      hints: ['Trace each statement carefully', 'Pay attention to syntax rules'],
      explanation: 'Educational practice challenge.',
    }

    // Template specific validations
    if (selectedType === 'fill_blank') {
      try {
        const parsedBlanks = JSON.parse(blanksJson)
        if (!Array.isArray(parsedBlanks) || parsedBlanks.length === 0) {
          toast.error('Blanks must be a non-empty JSON array.')
          return
        }
        for (const b of parsedBlanks) {
          if (!codeTemplate.includes(`___${b.id}___`)) {
            toast.error(`Template is missing placeholder: ___${b.id}___`)
            return
          }
        }
        contentObj.code_template = codeTemplate
        contentObj.blanks = parsedBlanks
      } catch {
        toast.error('Invalid JSON for blanks definition.')
        return
      }
    } else if (selectedType === 'bug_hunt') {
      const lines = bugCode.split('\n')
      if (bugLine < 1 || bugLine > lines.length) {
        toast.error(`Buggy line ${bugLine} is outside code line range (1-${lines.length}).`)
        return
      }
      const fixes = fixOptionsText.split('\n').map(f => f.trim()).filter(Boolean)
      if (fixes.length < 2) {
        toast.error('Provide at least 2 fix options.')
        return
      }
      contentObj.code = bugCode
      contentObj.bug_line = bugLine
      contentObj.bug_explanation = bugExplanation
      contentObj.fix_options = fixes
      contentObj.correct_fix_index = correctFixIndex
    } else if (selectedType === 'order_steps') {
      const steps = stepsText.split('\n').map(s => s.trim()).filter(Boolean)
      if (steps.length < 3) {
        toast.error('Order steps challenge requires at least 3 steps.')
        return
      }
      contentObj.steps = steps
    } else if (selectedType === 'visualizer') {
      contentObj.kind = 'fix_bug'
      contentObj.starter_code = starterCode
      contentObj.expected_output = expectedOutput
      contentObj.test_cases = [
        { name: 'Default Test', stdin: [], expected_stdout: expectedOutput },
      ]
    }

    setSaving(true)
    try {
      await api.post('/games/', {
        class_id: 1,
        title,
        game_type: selectedType,
        content_json: JSON.stringify(contentObj),
        max_points: 100,
        status,
        target_student_anon_id: targetStudent.trim() || null,
        ai_generated: false,
      })

      toast.success(`Challenge saved as ${status.toUpperCase()}!`)
      setShowModal(false)
      fetchGames()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save challenge.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-brand-400" /> Games & Challenge Builder
          </h1>
          <p className="text-slate-500 mt-1">
            Build and manage template-based classroom games and visualizer challenges
          </p>
        </div>

        <button
          id="new-game-btn"
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Game Challenge</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12">Loading games…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {games.map(game => {
            const meta = TYPE_CONFIG[game.game_type] || {
              label: game.game_type,
              color: 'badge-slate',
              emoji: '🎮',
            }
            const isApproved = game.status === 'approved' || game.status === 'published'

            return (
              <div
                key={game.id}
                className={`card p-6 border transition-all ${
                  isApproved ? 'border-surface-border hover:border-brand-600/40' : 'border-amber-500/30 bg-amber-950/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.emoji}</span>
                    <h3 className="font-semibold text-white">{game.title}</h3>
                  </div>
                  <span className={meta.color}>{meta.label}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                  <span>Max: {game.max_points} pts</span>
                  <span>·</span>
                  <span
                    className={`font-semibold uppercase ${
                      isApproved ? 'text-green-400' : 'text-amber-400'
                    }`}
                  >
                    {game.status}
                  </span>
                  {game.target_student_anon_id && (
                    <>
                      <span>·</span>
                      <span className="text-brand-300 flex items-center gap-1 font-mono">
                        <User className="w-3 h-3" /> {game.target_student_anon_id}
                      </span>
                    </>
                  )}
                  {game.linked_note_id && (
                    <>
                      <span>·</span>
                      <span>Note #{game.linked_note_id}</span>
                    </>
                  )}
                </div>

                {/* Teacher Action Controls for Draft */}
                {!isApproved && (
                  <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                    <span className="text-[11px] text-amber-400 italic">
                      Hidden from students until approved
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            // Quick publish/approve
                            await api.post('/games/', {
                              class_id: game.class_id,
                              title: game.title,
                              game_type: game.game_type,
                              content_json: game.content_json,
                              max_points: game.max_points,
                              status: 'approved',
                            })
                            toast.success('Approved!')
                            fetchGames()
                          } catch (err: any) {
                            toast.error('Action failed')
                          }
                        }}
                        className="btn-primary py-1 px-3 text-xs bg-emerald-600 hover:bg-emerald-500"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Comprehensive Game Builder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-600/30 flex items-center justify-center text-brand-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create Game Challenge</h2>
                  <p className="text-xs text-slate-400">Choose a template and configure the challenge</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Edit / Preview Tabs */}
                <div className="flex bg-surface p-1 rounded-xl border border-surface-border text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      activeTab === 'edit' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      activeTab === 'preview' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    Preview
                  </button>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Template Picker Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['fill_blank', 'bug_hunt', 'order_steps', 'visualizer'] as const).map(t => {
                const cfg = TYPE_CONFIG[t]
                const isSelected = selectedType === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-md'
                        : 'bg-surface border-surface-border text-slate-400 hover:text-white hover:bg-surface-hover'
                    }`}
                  >
                    <div className="text-lg mb-1">{cfg.emoji}</div>
                    <div className="font-bold text-xs">{cfg.label}</div>
                  </button>
                )
              })}
            </div>

            {activeTab === 'edit' ? (
              <div className="space-y-4 text-xs">
                {/* AI Draft Button & Grounding Banner */}
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleGenerateFromNote}
                      disabled={generatingAi}
                      className="btn-ghost py-1.5 px-3 border border-brand-500/30 text-brand-300 hover:bg-brand-600/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      <span>{generatingAi ? 'Generating...' : 'Generate from Note (RAG)'}</span>
                    </button>
                  </div>

                  {aiSources.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-teal-950/25 border border-teal-500/40 text-teal-300 text-xs flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                        <span>Grounded in: {Array.from(new Set(aiSources.map((s: any) => s.note_title))).join(', ')}</span>
                      </span>
                      <span className="text-[10px] text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-500/30">
                        Class notes RAG
                      </span>
                    </div>
                  )}
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block mb-1 font-medium">Challenge Title</label>
                    <input
                      className="input text-xs"
                      placeholder="e.g. Loop Accumulator"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Topic</label>
                    <select
                      className="input text-xs"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                    >
                      <option value="variables">Variables</option>
                      <option value="conditionals">Conditionals</option>
                      <option value="loops">Loops</option>
                      <option value="lists">Lists</option>
                      <option value="functions">Functions</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Difficulty Level (1-3)</label>
                    <select
                      className="input text-xs"
                      value={difficulty}
                      onChange={e => setDifficulty(parseInt(e.target.value, 10))}
                    >
                      <option value="1">1 - Beginner</option>
                      <option value="2">2 - Intermediate</option>
                      <option value="3">3 - Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Target Student (Optional)</label>
                    <input
                      className="input text-xs font-mono"
                      placeholder="e.g. S-004 (Leave blank for class)"
                      value={targetStudent}
                      onChange={e => setTargetStudent(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Prompt / Instructions</label>
                  <textarea
                    rows={2}
                    className="input text-xs resize-none"
                    placeholder="Instructions shown to the student..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                  />
                </div>

                {/* Template Specific Form Controls */}
                {selectedType === 'fill_blank' && (
                  <div className="space-y-3 p-4 rounded-xl bg-surface border border-surface-border">
                    <div className="font-semibold text-brand-300">Fill in the Blank Setup</div>
                    <div>
                      <label className="text-slate-400 block mb-1">
                        Code Template (use ___0___, ___1___ for blanks)
                      </label>
                      <textarea
                        rows={3}
                        className="input text-xs font-mono resize-none bg-black/40"
                        value={codeTemplate}
                        onChange={e => setCodeTemplate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Blanks Definition (JSON)</label>
                      <textarea
                        rows={4}
                        className="input text-xs font-mono resize-none bg-black/40"
                        value={blanksJson}
                        onChange={e => setBlanksJson(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {selectedType === 'bug_hunt' && (
                  <div className="space-y-3 p-4 rounded-xl bg-surface border border-surface-border">
                    <div className="font-semibold text-red-300">Bug Hunt Setup</div>
                    <div>
                      <label className="text-slate-400 block mb-1">Buggy Python Code</label>
                      <textarea
                        rows={4}
                        className="input text-xs font-mono resize-none bg-black/40"
                        value={bugCode}
                        onChange={e => setBugCode(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Buggy Line Number (1-indexed)</label>
                        <input
                          type="number"
                          className="input text-xs font-mono"
                          value={bugLine}
                          onChange={e => setBugLine(parseInt(e.target.value, 10) || 1)}
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Correct Fix Option Index (0-based)</label>
                        <input
                          type="number"
                          className="input text-xs font-mono"
                          value={correctFixIndex}
                          onChange={e => setCorrectFixIndex(parseInt(e.target.value, 10) || 0)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Fix Options (one per line)</label>
                      <textarea
                        rows={3}
                        className="input text-xs font-mono resize-none bg-black/40"
                        value={fixOptionsText}
                        onChange={e => setFixOptionsText(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {selectedType === 'order_steps' && (
                  <div className="space-y-3 p-4 rounded-xl bg-surface border border-surface-border">
                    <div className="font-semibold text-amber-300">Order Steps Setup</div>
                    <div>
                      <label className="text-slate-400 block mb-1">
                        Steps in Correct Order (one per line, minimum 3)
                      </label>
                      <textarea
                        rows={5}
                        className="input text-xs font-mono resize-none bg-black/40"
                        value={stepsText}
                        onChange={e => setStepsText(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {selectedType === 'visualizer' && (
                  <div className="space-y-3 p-4 rounded-xl bg-surface border border-surface-border">
                    <div className="font-semibold text-emerald-300">Visualizer Setup</div>
                    <div>
                      <label className="text-slate-400 block mb-1">Starter Code</label>
                      <textarea
                        rows={4}
                        className="input text-xs font-mono resize-none bg-black/40"
                        value={starterCode}
                        onChange={e => setStarterCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Expected Output (STDOUT)</label>
                      <textarea
                        rows={2}
                        className="input text-xs font-mono resize-none bg-black/40"
                        value={expectedOutput}
                        onChange={e => setExpectedOutput(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Live Preview */
              <div className="p-6 rounded-2xl bg-[#161622] border border-surface-border space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
                  <h4 className="font-bold text-white text-sm">{title || 'Untitled Challenge'}</h4>
                  <span className="badge badge-brand capitalize">{selectedType.replace('_', ' ')}</span>
                </div>
                <p className="text-xs text-slate-300">{prompt || 'No prompt specified yet.'}</p>

                {selectedType === 'fill_blank' && (
                  <pre className="p-4 rounded-xl bg-black/50 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                    {codeTemplate}
                  </pre>
                )}
                {selectedType === 'bug_hunt' && (
                  <pre className="p-4 rounded-xl bg-black/50 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                    {bugCode}
                  </pre>
                )}
                {selectedType === 'order_steps' && (
                  <div className="space-y-1">
                    {stepsText.split('\n').filter(Boolean).map((s, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-surface border border-surface-border text-xs font-mono text-slate-300">
                        {i + 1}. {s}
                      </div>
                    ))}
                  </div>
                )}
                {selectedType === 'visualizer' && (
                  <pre className="p-4 rounded-xl bg-black/50 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                    {starterCode}
                  </pre>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-surface-border flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                You can save as DRAFT or approve immediately.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveChallenge('draft')}
                  disabled={saving}
                  className="btn-ghost text-xs py-2 px-4 border border-surface-border text-amber-300"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveChallenge('approved')}
                  disabled={saving}
                  className="btn-primary text-xs py-2 px-4"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Publish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
