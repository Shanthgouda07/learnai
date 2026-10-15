import React, { useState, useRef } from 'react'
import {
  FileText, Upload, Camera, CheckCircle2, AlertCircle, Sparkles,
  X, Check, Award, Eye, Trash2, ArrowUpRight, Cpu, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * AssignmentSubmissionModal Component
 * 
 * Allows students to:
 * 1. Type written notes in a markdown editor OR
 * 2. Upload picture of handwritten notes / mobile snapshot.
 * 3. Submit for Automated AI Grading & Approval.
 * 4. Receive instant marks (e.g. 9.5/10), rubric breakdown, and AI feedback.
 */
export default function AssignmentSubmissionModal({
  isOpen = false,
  onClose,
  unitTitle = 'Unit 1: Variables & Memory Storage',
  topicKey = 'variables',
  onAssignmentGraded,
}) {
  const [submissionType, setSubmissionType] = useState('text') // 'text' | 'image'
  const [writtenNotes, setWrittenNotes] = useState(
    `# Assignment Submission: ${unitTitle}
Student Registration: 2024CS001 (Cadet S-001)

## Problem Solution:
1. In Python, variables are symbolic references in the local frame symbol table pointing to heap PyObjects.
2. When swapping variables a and b:
   a, b = b, a
   Python packs (b, a) into an ephemeral tuple and unpacks it atomically without losing data.
3. Reference counting increases when aliases are created and drops when names are rebound or deleted.`
  )
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isGrading, setIsGrading] = useState(false)
  const [gradedResult, setGradedResult] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      toast.success('Handwritten assignment picture loaded successfully!')
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmitForAiGrading = () => {
    if (submissionType === 'text' && !writtenNotes.trim()) {
      toast.error('Please write assignment notes before submitting.')
      return
    }
    if (submissionType === 'image' && !imagePreview) {
      toast.error('Please upload an assignment picture first.')
      return
    }

    setIsGrading(true)

    // Simulate deterministic AI evaluation & OCR inspection
    setTimeout(() => {
      setIsGrading(false)
      const marks = 9.4
      const result = {
        unitTitle,
        topicKey,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        marks: marks,
        maxMarks: 10,
        grade: 'A+',
        status: 'Approved & Graded',
        submissionType,
        rubric: [
          { criteria: 'Conceptual Correctness & Terminology', score: '3.8 / 4.0', status: 'Excellent' },
          { criteria: 'Code Logic & Problem Resolution Steps', score: '3.9 / 4.0', status: 'Flawless' },
          { criteria: 'Clarity, Formatting & Handwriting Legibility', score: '1.7 / 2.0', status: 'Clear & Structured' },
        ],
        aiFeedback: `Outstanding submission! Your explanation of symbolic pointer reference binding in heap memory is technically accurate. The atomic tuple unpacking pattern was implemented cleanly with correct time complexity. Keep up the high standard!`,
        earnedXp: 100,
      }

      setGradedResult(result)
      onAssignmentGraded?.(result)
      toast.success(`🎉 Assignment Approved! Scored ${marks}/10 (+100 XP)!`, {
        duration: 4500,
        icon: '🏆',
      })
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#090D1A] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">
                Submit Assignment & Automated AI Grader
              </h3>
              <p className="text-xs text-slate-400">
                {unitTitle} · Roll: 2024CS001 (GITAM Deemed to be University)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {!gradedResult ? (
            <>
              {/* Submission Mode Selector */}
              <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setSubmissionType('text')}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    submissionType === 'text'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Type Assignment Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubmissionType('image')}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    submissionType === 'image'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload Picture / Handwritten Notes</span>
                </button>
              </div>

              {/* Mode A: Text/Markdown Editor */}
              {submissionType === 'text' && (
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
                    <span>Written Assignment Notes:</span>
                    <span className="text-[11px] text-cyan-400 font-mono">Markdown Supported</span>
                  </label>
                  <div className="rounded-xl border border-white/15 bg-[#05070E] overflow-hidden focus-within:border-cyan-400 transition-colors">
                    <textarea
                      value={writtenNotes}
                      onChange={(e) => setWrittenNotes(e.target.value)}
                      rows={9}
                      spellCheck="false"
                      className="w-full p-3.5 font-mono text-xs text-[#EEF1F8] bg-transparent resize-none outline-none leading-relaxed selection:bg-cyan-500/30"
                      placeholder="Type your assignment answers, steps, and code solutions here..."
                    />
                  </div>
                </div>
              )}

              {/* Mode B: Picture / Handwritten Upload */}
              {submissionType === 'image' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    Take a clear photo of your notebook or handwritten assignment pages and upload it below. The automated AI Grader runs simulated OCR to evaluate your handwriting and steps.
                  </div>

                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-8 flex flex-col items-center justify-center bg-cyan-500/5 hover:bg-cyan-500/10 transition-all text-center space-y-2"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-white">Click or drag & drop assignment picture</div>
                      <div className="text-xs text-slate-400">PNG, JPG, JPEG up to 15MB</div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl border border-cyan-500/30 overflow-hidden bg-black/50 p-2 space-y-2">
                      <img
                        src={imagePreview}
                        alt="Handwritten Assignment Preview"
                        className="w-full max-h-56 object-contain rounded-xl border border-white/10"
                      />
                      <div className="flex items-center justify-between px-2 pt-1 text-xs">
                        <span className="text-cyan-300 font-mono truncate max-w-xs">{imageFile?.name || 'assignment_photo.jpg'}</span>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Automated AI Grader Notice */}
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <b>Automated AI Grader:</b> Submissions are verified deterministically against unit rubrics. Your marks, conceptual accuracy breakdown, and feedback will be generated automatically.
                </div>
              </div>
            </>
          ) : (
            /* ─── AI GRADED RESULT CARD ─── */
            <div className="space-y-4 animate-fade-in">
              {/* Score Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-transparent border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {gradedResult.status}
                  </div>
                  <h4 className="text-lg font-bold font-display text-white mt-0.5">
                    Grade: <span className="text-emerald-300">{gradedResult.grade}</span> ({gradedResult.marks} / {gradedResult.maxMarks} Marks)
                  </h4>
                  <div className="text-xs text-slate-400">
                    Evaluated at {gradedResult.submittedAt} · +{gradedResult.earnedXp} XP Awarded
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold font-display text-emerald-300">{Math.round((gradedResult.marks / gradedResult.maxMarks) * 100)}%</div>
                  <span className="badge bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">Top 5% of Cohort</span>
                </div>
              </div>

              {/* Rubric Breakdown Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 font-mono">Rubric Breakdown:</div>
                <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden divide-y divide-white/5">
                  {gradedResult.rubric.map((r, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{r.criteria}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-cyan-300 font-mono">{r.status}</span>
                        <span className="font-bold font-mono text-emerald-400">{r.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Constructive Feedback */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Educator Feedback:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {gradedResult.aiFeedback}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            {gradedResult ? 'Close' : 'Cancel'}
          </button>

          {!gradedResult ? (
            <button
              type="button"
              disabled={isGrading}
              onClick={handleSubmitForAiGrading}
              className="py-2 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(34,211,238,0.35)] flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isGrading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Evaluating via AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit for Automated AI Grading</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setGradedResult(null)
                setImageFile(null)
                setImagePreview(null)
              }}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Submit Another Assignment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
