import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  X,
  ChevronRight,
  Download,
  UserCheck,
  CreditCard,
  Camera,
  Layers
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Task, TaskStep, TaskTerm, Submission } from '../types'
import { Badge } from '../components/common/Badge'
import { ShimmerDetail } from '../components/common/Shimmer'
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

  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadTaskData = async () => {
      setLoading(true)
      setError(null)
      try {
        // 1. Fetch Task
        const { data: taskData, error: taskErr } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .single()

        if (taskErr) throw taskErr
        setTask(taskData)

        // 2. Fetch Steps
        const { data: stepsData } = await supabase
          .from('task_steps')
          .select('*')
          .eq('task_id', id)
          .order('step_order', { ascending: true })

        setSteps(stepsData || [])

        // 3. Fetch Terms
        const { data: termsData } = await supabase
          .from('task_terms')
          .select('*')
          .eq('task_id', id)
          .order('term_order', { ascending: true })

        setTerms(termsData || [])

        // 4. Check user existing submission
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
      setUploadError(`You can upload a maximum of ${maxImages} screenshots.`)
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
      setUploadError('Please select at least one screenshot proof before submitting.')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(10)

    try {
      // 1. Create or update submission record
      const { data: sub, error: subErr } = await supabase
        .from('submissions')
        .upsert(
          {
            user_id: user.id,
            task_id: task.id,
            status: 'pending',
            reject_reason: null,
            created_at: new Date().toISOString()
          },
          { onConflict: 'user_id,task_id' }
        )
        .select()
        .single()

      if (subErr) throw subErr
      setUploadProgress(35)

      // 2. Upload images to Supabase Storage
      const uploadedUrls: string[] = []
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const ext = file.name.split('.').pop() || 'png'
        const filePath = `${user.id}/${task.id}/${Date.now()}_${i}.${ext}`

        const { error: upErr } = await supabase.storage
          .from('proof_images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (upErr) throw upErr

        const { data: urlData } = supabase.storage
          .from('proof_images')
          .getPublicUrl(filePath)

        uploadedUrls.push(urlData.publicUrl)
        setUploadProgress(35 + Math.round(((i + 1) / selectedFiles.length) * 45))
      }

      // 3. Insert images into submission_images
      const imageRecords = uploadedUrls.map(url => ({
        submission_id: sub.id,
        image_url: url
      }))

      const { error: imgErr } = await supabase
        .from('submission_images')
        .insert(imageRecords)

      if (imgErr) throw imgErr

      setUploadProgress(100)
      setSubmitSuccess(true)
      setExistingSubmission(sub)
      sound.playSuccess()

      // Clean up files
      setSelectedFiles([])
      setPreviewUrls([])
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Step icons for roadmap
  const getStepIcon = (order: number) => {
    switch (order) {
      case 1:
        return <Download className="w-4 h-4 text-emerald-400" />
      case 2:
        return <UserCheck className="w-4 h-4 text-cyan-400" />
      case 3:
        return <CreditCard className="w-4 h-4 text-indigo-400" />
      case 4:
        return <Sparkles className="w-4 h-4 text-amber-400" />
      case 5:
        return <Camera className="w-4 h-4 text-rose-400" />
      default:
        return <Layers className="w-4 h-4 text-emerald-400" />
    }
  }

  if (loading) {
    return <ShimmerDetail />
  }

  if (error || !task) {
    return (
      <div className="rounded-3xl p-8 bg-slate-900 border border-slate-800 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-100 font-heading mb-2">Offer Not Available</h2>
        <p className="text-sm text-slate-400 mb-6">{error || 'This task could not be found or has expired.'}</p>
        <button
          onClick={() => navigate('/offers')}
          className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
        >
          Browse All Offers
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playPop()
            navigate(-1)
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors p-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Instant Verification</span>
        </div>
      </div>

      {/* Hero Task Banner */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
        <img
          src={task.banner_url || task.logo_url}
          alt={task.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={task.logo_url}
              alt={task.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 bg-slate-900 shadow-md"
            />
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                {task.category || 'App Task'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
                {task.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            {task.badge_hot && <Badge variant="hot" text="Hot Offer" />}
            {task.badge_exclusive && <Badge variant="exclusive" text="Exclusive" />}
            {task.badge_new && <Badge variant="new" text="New" />}
            {task.badge_limited && <Badge variant="limited" text="Limited Time" />}
          </div>
        </div>
      </div>

      {/* Prize & Primary Action Card */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 to-slate-900/90 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="text-center sm:text-left">
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Reward Amount
          </span>
          <div className="text-3xl font-black text-emerald-400 font-heading">
            ₹{task.prize_inr}{' '}
            <span className="text-xs font-bold text-slate-400 uppercase tracking-normal">INR</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Credit directly to wallet on admin approval
          </span>
        </div>

        <a
          href={task.play_store_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.playPop()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
        >
          <span>Open on Play Store</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Submission Status Alert (If already submitted) */}
      {existingSubmission && (
        <div
          className={`p-5 rounded-3xl border flex items-start gap-3.5 ${
            existingSubmission.status === 'approved'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : existingSubmission.status === 'rejected'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          }`}
        >
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold block capitalize text-base font-heading mb-0.5">
              Status: {existingSubmission.status}
            </span>
            <p className="opacity-90 leading-relaxed">
              {existingSubmission.status === 'approved'
                ? 'Great job! Your submission has been approved and reward is added to your wallet balance.'
                : existingSubmission.status === 'rejected'
                ? `Submission was rejected: "${existingSubmission.reject_reason || 'Screenshots could not be verified'}". Please review the steps and submit clear proof again below.`
                : 'Your screenshots are currently under review by our admin team (usually approved within 24 hours).'}
            </p>
          </div>
        </div>
      )}

      {/* 5-Step Clear Roadmap (Non-interactive instructions, no fake checkboxes) */}
      <div className="rounded-3xl p-5 sm:p-7 bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-heading text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Task Completion Guide (5 Steps)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Follow these sequential steps carefully to ensure your reward is approved without delay.
          </p>
        </div>

        {/* Vertical Connected Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {steps.map((step, idx) => (
            <div key={step.id || idx} className="relative group">
              {/* Step Number Dot */}
              <div className="absolute -left-6 sm:-left-8 top-0 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center text-[11px] font-bold text-emerald-400 shadow-md">
                {step.step_order}
              </div>

              {/* Step Card Content */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
                    {getStepIcon(step.step_order)}
                  </div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    Step {step.step_order}
                  </span>
                  <span className="text-sm font-bold text-slate-100 font-heading">
                    {step.title}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {step.body}
                </p>

                {step.image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-800 max-w-xs">
                    <img
                      src={step.image_url}
                      alt={step.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Demo Proof (If available) */}
      {task.demo_proof_url && (
        <div className="rounded-3xl p-5 bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Sample Proof Screenshot (How it should look)</span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-800 max-w-sm mx-auto">
            <img
              src={task.demo_proof_url}
              alt="Demo Proof"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      {terms.length > 0 && (
        <div className="rounded-3xl p-5 sm:p-6 bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Terms & Conditions</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
            {terms.map(t => (
              <li key={t.id} className="leading-relaxed">
                <span className="text-slate-300 font-semibold">{t.title}: </span>
                {t.body}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Screenshot Proof Submission Box */}
      <div className="rounded-3xl p-5 sm:p-7 bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-400" />
              <span>Step 5: Upload Screenshot Proof</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload clear screenshots showing registration or transaction confirmation.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Max {task.proof_max_images || 5} Images
          </span>
        </div>

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Submit Success Message */}
        {submitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Proof submitted successfully! Our admin will review and credit your reward within 24h.
            </span>
          </div>
        )}

        {/* Preview Selected Files */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {previewUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700 group bg-slate-950"
              >
                <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dropzone File Picker */}
        <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:scale-105 transition-all mb-3 shadow-md">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-200 text-center">
            Tap to select screenshots from Gallery
          </span>
          <span className="text-[11px] text-slate-400 text-center mt-1">
            PNG, JPG, WEBP (Max 5 MB each)
          </span>
        </label>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Uploading screenshots to secure vault...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        )}

        {/* Submit Proof Action Button */}
        <button
          onClick={handleSubmitProof}
          disabled={isUploading || selectedFiles.length === 0}
          className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Submitting Proof...</span>
            </div>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Proof for ₹{task.prize_inr} Reward</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
