import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Flame,
  Trophy,
  Users,
  Wallet,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Zap,
  Gift,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Banner, Task } from '../types'
import { useAuth } from '../context/AuthContext'
import { TaskBadge } from '../components/common/Badge'
import { UserAvatar } from '../components/common/UserAvatar'
import { BannerSkeleton, CardSkeleton } from '../components/common/Shimmer'
import { sound } from '../lib/audio'

export const Home: React.FC = () => {
  const { user, profile } = useAuth()
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

      // 2. Fetch tasks
      const { data: tData, error: tErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (tErr) throw tErr
      const allTasks = tData || []
      setTotalTasksCount(allTasks.length)
      setFeaturedTasks(allTasks.filter(t => t.featured).slice(0, 5))
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

  const avatarSrc = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Mobile Greeting & Wallet Hero Card */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={avatarSrc}
              name={profile?.display_name || user?.user_metadata?.full_name}
              size="md"
            />
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">
                Welcome back,
              </span>
              <span className="text-base font-black text-white font-heading">
                {profile?.display_name?.split(' ')[0] || 'User'} 👋
              </span>
            </div>
          </div>

          <Link
            to="/refer"
            onClick={() => sound.playPop()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Refer & Earn</span>
          </Link>
        </div>

        {/* Balance & Quick Actions */}
        <div className="flex items-end justify-between pt-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Available Balance
            </span>
            <div className="text-3xl font-black text-emerald-400 font-heading">
              ₹{Number(profile?.balance || 0).toFixed(0)}{' '}
              <span className="text-xs font-bold text-slate-400 font-sans uppercase">INR</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playPop()
                navigate('/wallet')
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              Withdraw
            </button>
            <button
              onClick={() => {
                sound.playPop()
                navigate('/offers')
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              Earn More
            </button>
          </div>
        </div>
      </div>

      {/* 2. Promo Slider Banners */}
      {loading ? (
        <BannerSkeleton />
      ) : banners.length > 0 ? (
        <div className="relative w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl group">
          <div className="relative h-44 sm:h-52 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBannerIdx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
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
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Featured Promotion
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white font-heading">
                    {banners[currentBannerIdx]?.title}
                  </h3>
                  {banners[currentBannerIdx]?.subtitle && (
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                      {banners[currentBannerIdx]?.subtitle}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-2.5 right-4 z-20 flex items-center gap-1.5">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentBannerIdx(idx)
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      currentBannerIdx === idx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* 3. Quick Navigation Hub */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/leaderboard"
          onClick={() => sound.playPop()}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-200 block">Leaderboard</span>
            <span className="text-[10px] text-slate-400 block">Top Earners</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </Link>

        <Link
          to="/refer"
          onClick={() => sound.playPop()}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-200 block">Refer Friends</span>
            <span className="text-[10px] text-slate-400 block">₹10 Per Friend</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </Link>
      </div>

      {/* 4. Featured Tasks Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white font-heading">
              Featured Offers
            </h2>
            <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono">
              {totalTasksCount} Live
            </span>
          </div>
          <Link
            to="/offers"
            onClick={() => sound.playPop()}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : featuredTasks.length > 0 ? (
          <div className="space-y-2.5">
            {featuredTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  sound.playPop()
                  navigate(`/offers/${t.id}`)
                }}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3.5 cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={t.logo_url}
                    alt={t.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-950 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block truncate">
                        {t.category || 'App Task'}
                      </span>
                      {t.badge_hot && <TaskBadge badge="hot" />}
                      {t.badge_exclusive && <TaskBadge badge="exclusive" />}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-heading truncate">
                      {t.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      5 simple steps • Instant payout
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-base font-black text-emerald-400 font-heading">
                    +₹{t.prize_inr}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                    Reward
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900 text-center text-xs text-slate-400">
            No featured tasks at the moment. Check back soon!
          </div>
        )}
      </div>

      {/* 5. Trust & How It Works Strip */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-bold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>How Cash Reward Works</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          1. Pick a task → 2. Follow the 5 simple steps → 3. Upload screenshot proof → 4. Get cash credited directly to your UPI/Bank.
        </p>
      </div>
    </div>
  )
}
