import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Layers,
  Trophy,
  Users,
  Wallet,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Banner, Task } from '../types'
import { useAuth } from '../context/AuthContext'
import { TaskBadge } from '../components/common/Badge'
import { BannerSkeleton, CardSkeleton } from '../components/common/Shimmer'
import { sound } from '../lib/audio'

export const Home: React.FC = () => {
  const { user, profile, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [banners, setBanners] = useState<Banner[]>([])
  const [featuredTasks, setFeaturedTasks] = useState<Task[]>([])
  const [totalTasksCount, setTotalTasksCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch active banners
      const { data: bData, error: bErr } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })

      if (bErr) throw bErr
      setBanners(bData || [])

      // 2. Fetch featured tasks
      const { data: tData, error: tErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (tErr) throw tErr
      const allTasks = tData || []
      setTotalTasksCount(allTasks.length)
      setFeaturedTasks(allTasks.filter(t => t.featured).slice(0, 4))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load home data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-slide banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentBannerIdx(prev => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Slider Banners */}
      {loading ? (
        <BannerSkeleton />
      ) : banners.length > 0 ? (
        <div className="relative w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl group">
          <div className="relative h-44 sm:h-60 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBannerIdx}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 cursor-pointer"
                onClick={() => {
                  sound.playPop()
                  const link = banners[currentBannerIdx]?.link || '/offers'
                  navigate(link)
                }}
              >
                <img
                  src={banners[currentBannerIdx]?.image_url}
                  alt={banners[currentBannerIdx]?.title}
                  className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5 sm:p-8">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 w-fit mb-2 backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Featured Promo
                  </span>
                  <h2 className="text-xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
                    {banners[currentBannerIdx]?.title}
                  </h2>
                  {banners[currentBannerIdx]?.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl line-clamp-2">
                      {banners[currentBannerIdx]?.subtitle}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Banner Controls */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    sound.playPop()
                    setCurrentBannerIdx(prev => (prev - 1 + banners.length) % banners.length)
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    sound.playPop()
                    setCurrentBannerIdx(prev => (prev + 1) % banners.length)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
                  aria-label="Next banner"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-3 right-5 flex items-center gap-1.5 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={e => {
                        e.stopPropagation()
                        sound.playPop()
                        setCurrentBannerIdx(idx)
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentBannerIdx ? 'w-6 bg-emerald-400' : 'w-2 bg-white/40'
                      }`}
                      aria-label={`Go to banner ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* 2. Quick Stats & Welcome Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Wallet Overview Card */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Wallet Balance
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-emerald-400 mb-1">
              ₹{profile ? Number(profile.balance || 0).toFixed(0) : '0'}
            </div>
            <span className="text-xs text-slate-500">
              Total Earned: ₹{profile ? Number(profile.total_earned || 0).toFixed(0) : '0'}
            </span>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
            {user ? (
              <Link
                to="/wallet"
                onClick={() => sound.playPop()}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                Request Withdrawal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={() => {
                  sound.playPop()
                  signInWithGoogle()
                }}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                Sign in to withdraw <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Available Tasks Card */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Offers
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold font-heading text-teal-300 mb-1">
              {totalTasksCount} Available
            </div>
            <span className="text-xs text-slate-500">Verified cash payouts ready to claim</span>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <Link
              to="/offers"
              onClick={() => sound.playPop()}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
            >
              Browse All Offers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-lg flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
            Quick Actions
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/leaderboard"
              onClick={() => sound.playPop()}
              className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center justify-center gap-1 text-center transition-all group"
            >
              <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">Leaderboard</span>
            </Link>
            <Link
              to="/refer"
              onClick={() => sound.playPop()}
              className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex flex-col items-center justify-center gap-1 text-center transition-all group"
            >
              <Users className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">Refer & Earn</span>
            </Link>
          </div>
          <div className="mt-3 text-center">
            <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Instant verification
            </span>
          </div>
        </div>
      </div>

      {/* 3. Featured Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg sm:text-xl font-bold font-heading">Featured Tasks</h3>
          </div>
          <Link
            to="/offers"
            onClick={() => sound.playPop()}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View all ({totalTasksCount}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : error ? (
          <div className="rounded-3xl p-6 bg-slate-900 border border-rose-500/30 text-center">
            <p className="text-sm text-rose-400 mb-3">{error}</p>
            <button
              onClick={() => fetchData()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        ) : featuredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredTasks.map(task => (
              <Link
                key={task.id}
                to={`/offers/${task.id}`}
                onClick={() => sound.playPop()}
                className="group p-4 rounded-3xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all flex items-center gap-4 shadow-md hover:shadow-emerald-500/5 hover:-translate-y-0.5"
              >
                <img
                  src={task.logo_url}
                  alt={task.name}
                  className="w-14 h-14 rounded-2xl object-cover bg-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {task.badge_hot && <TaskBadge type="hot" />}
                    {task.badge_exclusive && <TaskBadge type="exclusive" />}
                    {task.badge_new && <TaskBadge type="new" />}
                    {task.badge_limited && <TaskBadge type="limited" />}
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 truncate font-heading group-hover:text-emerald-400 transition-colors">
                    {task.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {task.title}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs text-slate-500 block leading-none">Earn</span>
                  <span className="text-base font-extrabold text-emerald-400 font-heading">
                    ₹{task.prize_inr}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl p-8 bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-sm text-slate-400">No featured tasks at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
