import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Upload,
  CheckCircle2,
  Circle,
  FileText,
  AlertCircle,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Task, TaskStep, TaskTerm, Submission } from '../types'
import { useAuth } from '../context/AuthContext'
import { TaskBadge } from '../components/common/Badge'
import { sound } from '../lib/audio'

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, signInWithGoogle } = useAuth()

  const [task, setTask] = useState<Task | null>(null)
  const [steps, setSteps] = useState<TaskStep[]>([])
  const [terms, setTerms] = useState<TaskTerm[]>([])
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Step completion toggle tracking
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({})

  // Proof submission states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadTaskData = async () => {
      setLoading(true)
      setError(null)
      try {
        // 1. Fetch Task
        const { data: tData, error: tErr } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single()

        if (tErr) throw tErr
        setTask(tData)

        // 2. Fetch Steps
        const { data: sData } = await supabase
          .from('task_steps')
          .select('*')
          .eq('task_id', id)
          .order('step_order', { ascending: true })

        setSteps(sData || [])

        // 3. Fetch Terms
        const { data: tmData } = await supabase
          .from('task_terms')
          .select('*')
          .eq('task_id', id)
          .order('term_order', { ascending: true })

        setTerms(tmData || [])

        // 4. Check existing submission if user is logged in
        if (user) {
          const { data: subData } = await supabase
            .from('submissions')
            .select('*')
            .eq('user_id', user.id)
            .eq('task_id', id)
            .maybeSingle()

          if (subData) {
            setExistingSubmission(subData)
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load task details')
      } finally {
        setLoading(false)
      }
    }

    loadTaskData()
  }, [id, user])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const maxImages = task?.proof_max_images || 5
    if (selectedFiles.length + files.length > maxImages) {
      setUploadError(`You can upload a maximum of ${maxImages} images for this task.`)
      return
    }

    // Validate size (5MB per file)
    const oversized = files.some(f => f.size > 5 * 1024 * 1024)
    if (oversized) {
      setUploadError('Each screenshot must be under 5 MB in size.')
      return
    }

    const newFiles = [...selectedFiles, ...files]
    setSelectedFiles(newFiles)

    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviews])
    sound.playPop()
  }

  const removeFile = (index: number) => {
    sound.playPop()
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  // Handle proof submission
  const handleSubmitProof = async () => {
    if (!user) {
      signInWithGoogle()
      return
    }
    if (!task) return

    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one proof screenshot.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // 1. Create or update submission record
      const { data: sub, error: subErr } = await supabase
        .from('submissions')
        .upsert(
          {
            user_id: user.id,
            task_id: task.id,
            status: 'pending',
            created_at: new Date().toISOString()
          },
          { onConflict: 'user_id,task_id' }
        )
        .select()
        .single()

      if (subErr) throw subErr

      // 2. Upload images to Supabase Storage
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${user.id}/${sub.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: upErr } = await supabase.storage
          .from('proof_images')
          .upload(fileName, file, { upsert: true })

        if (!upErr) {
          const { data: urlData } = supabase.storage
            .from('proof_images')
            .getPublicUrl(fileName)

          // Insert image record
          await supabase.from('submission_images').insert({
            submission_id: sub.id,
            image_url: urlData.publicUrl
          })
        }
      }

      setUploadSuccess(true)
      setExistingSubmission(sub)
      sound.playSuccess()
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Submission failed. Please check your network.')
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="w-full h-48 sm:h-64 rounded-3xl bg-slate-800" />
        <div className="h-6 bg-slate-800 rounded w-1/3" />
        <div className="h-24 bg-slate-800 rounded-3xl" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="rounded-3xl p-8 bg-slate-900 border border-slate-800 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-100 font-heading mb-2">Offer Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error || 'This task does not exist or has expired.'}</p>
        <button
          onClick={() => navigate('/offers')}
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
        >
          Back to Offers
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Back Navigation */}
      <button
        onClick={() => {
          sound.playPop()
          navigate(-1)
        }}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Offers
      </button>

      {/* Hero Banner (16:9) */}
      <div className="relative w-full aspect-video sm:max-h-80 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
        <img
          src={task.banner_url || task.logo_url}
          alt={task.name}
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {task.badge_hot && <TaskBadge type="hot" />}
            {task.badge_exclusive && <TaskBadge type="exclusive" />}
            {task.badge_new && <TaskBadge type="new" />}
            {task.badge_limited && <TaskBadge type="limited" />}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
            {task.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {task.title}
          </p>
        </div>
      </div>

      {/* Reward Overview & Play Store Button */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
            Total Reward for Completion
          </span>
          <div className="text-3xl font-extrabold text-emerald-400 font-heading">
            ₹{task.prize_inr} INR
          </div>
          <span className="text-xs text-slate-400">
            Instant wallet credit after screenshot verification.
          </span>
        </div>

        <a
          href={task.play_store_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playPop()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
        >
          <span>Open in Play Store</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Existing Submission Banner */}
      {existingSubmission && (
        <div
          className={`p-5 rounded-3xl border flex items-center gap-3.5 ${
            existingSubmission.status === 'approved'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : existingSubmission.status === 'rejected'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          }`}
        >
          <Info className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-bold block capitalize font-heading">
              Submission Status: {existingSubmission.status}
            </span>
            <span className="text-xs opacity-90 block mt-0.5">
              {existingSubmission.status === 'approved'
                ? 'Your task has been approved and reward credited to your wallet balance!'
                : existingSubmission.status === 'rejected'
                ? `Submission rejected: ${existingSubmission.reject_reason || 'Screenshots could not be verified'}. You may re-submit below.`
                : 'Your submission is under admin review (usually processed within 24-48 hours).'}
            </span>
          </div>
        </div>
      )}

      {/* 5 Step Completion Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          Follow Steps to Complete
        </h2>

        <div className="space-y-3">
          {steps.map(step => {
            const isDone = !!completedSteps[step.step_order]
            return (
              <div
                key={step.id}
                onClick={() => {
                  sound.playPop()
                  setCompletedSteps(prev => ({
                    ...prev,
                    [step.step_order]: !prev[step.step_order]
                  }))
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 flex-shrink-0 text-slate-400 focus:outline-none"
                  aria-label="Toggle step completion"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      Step {step.step_order}
                    </span>
                    <span className="text-sm font-bold text-slate-200 font-heading">
                      {step.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.body}
                  </p>
                  {step.image_url && (
                    <img
                      src={step.image_url}
                      alt={step.title}
                      className="mt-3 rounded-xl max-h-48 object-cover border border-slate-800"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Demo Proof Image if available */}
      {task.demo_proof_url && (
        <div className="rounded-3xl p-5 bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-heading">
            <Info className="w-4 h-4 text-emerald-400" /> Demo Screenshot Sample
          </span>
          <p className="text-xs text-slate-400">
            Refer to this sample image to understand which screen needs to be captured for verification.
          </p>
          <img
            src={task.demo_proof_url}
            alt="Demo Proof Sample"
            className="rounded-2xl max-h-56 object-cover border border-slate-700 mt-2"
          />
        </div>
      )}

      {/* Terms & Conditions */}
      {terms.length > 0 && (
        <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold font-heading text-slate-200">
              Terms & Conditions
            </h3>
          </div>
          <div className="space-y-2">
            {terms.map(t => (
              <div key={t.id} className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">{t.title}: </span>
                {t.body}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Submission Card */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center gap-2">
          <Upload className="w-5 h-5 text-emerald-400" />
          Submit Task Proof
        </h3>
        <p className="text-xs text-slate-400">
          Upload clear screenshots from your gallery (Max {task.proof_max_images} images, up to 5 MB each).
        </p>

        {uploadSuccess ? (
          <div className="rounded-2xl p-6 bg-emerald-500/15 border border-emerald-500/40 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-emerald-300 font-heading">
              Proof Submitted Successfully!
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Your submission has been received and queued for admin review. You can track this in your Task History.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Input Box */}
            <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/40">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">
                Click or drag screenshots here to upload
              </span>
              <span className="text-[11px] text-slate-500">
                PNG, JPG or JPEG up to 5 MB
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            {/* Error Message */}
            {uploadError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                {uploadError}
              </p>
            )}

            {/* Thumbnails Preview */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 group">
                    <img src={url} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitProof}
              disabled={isUploading || selectedFiles.length === 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to Supabase Storage...</span>
                </>
              ) : (
                <span>Submit Proof ({selectedFiles.length}/{task.proof_max_images} Images)</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
