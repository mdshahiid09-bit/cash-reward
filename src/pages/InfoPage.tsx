import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { PageContent } from '../types'
import { sound } from '../lib/audio'

export const InfoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const fetchPage = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', slug)
          .single()

        if (err) throw err
        setPage(data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Page not found')
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [slug])

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="h-64 bg-slate-800 rounded-3xl" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="rounded-3xl p-8 bg-slate-900 border border-slate-800 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-100 font-heading mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">The requested information page could not be located.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
        >
          Return Home
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <button
        onClick={() => {
          sound.playPop()
          navigate(-1)
        }}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="rounded-3xl p-6 sm:p-8 bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            {page.title}
          </h1>
        </div>

        <div className="text-sm text-slate-300 leading-relaxed space-y-4 whitespace-pre-line font-normal">
          {page.body}
        </div>
      </div>
    </div>
  )
}
