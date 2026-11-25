import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Award, Crown, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { useAuth } from '../context/AuthContext'
import { UserAvatar } from '../components/common/UserAvatar'
import { sound } from '../lib/audio'

export const Leaderboard: React.FC = () => {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        // Ties: the user who reached the amount first ranks higher (created_at ASC)
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, total_earned, created_at')
          .order('total_earned', { ascending: false })
          .order('created_at', { ascending: true })
          .limit(50)

        setLeaders((data as Profile[]) || [])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const top1 = leaders[0]
  const top2 = leaders[1]
  const top3 = leaders[2]
  const restLeaders = leaders.slice(3)

  return (
    <div className="space-y-6 animate-fadeIn max-w-xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-2">
          <Crown className="w-3.5 h-3.5" /> Hall of Fame
        </span>
        <h1 className="text-2xl font-black font-heading text-slate-100 mb-1">
          Top Earners
        </h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Ranked by lifetime task earnings. Compete and claim your spot on the podium!
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-44 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-14 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      ) : leaders.length > 0 ? (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-2 items-end pt-8 pb-3">
            {/* Rank 2 (Silver) */}
            {top2 ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <UserAvatar
                    src={top2.avatar_url}
                    name={top2.display_name}
                    size="md"
                    className="border-slate-300"
                  />
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-300 text-slate-950 flex items-center justify-center font-black text-[10px] shadow">
                    2
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-200 truncate max-w-[80px] text-center block mt-1">
                  {top2.display_name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-xs font-extrabold text-slate-300 font-heading">
                  ₹{Number(top2.total_earned || 0).toFixed(0)}
                </span>
                <div className="w-full h-20 rounded-t-2xl bg-gradient-to-t from-slate-900 to-slate-800 border-t border-x border-slate-700/60 mt-2 flex items-center justify-center">
                  <Medal className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            ) : <div />}

            {/* Rank 1 (Gold) */}
            {top1 ? (
              <div className="flex flex-col items-center -mt-4">
                <div className="relative mb-2">
                  <Crown className="w-6 h-6 text-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 drop-shadow animate-bounce" />
                  <UserAvatar
                    src={top1.avatar_url}
                    name={top1.display_name}
                    size="lg"
                    className="border-amber-400 ring-4 ring-amber-400/20"
                  />
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-lg">
                    1
                  </div>
                </div>
                <span className="text-xs font-black text-amber-300 truncate max-w-[100px] text-center block mt-1 font-heading">
                  {top1.display_name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-sm font-black text-amber-400 font-heading">
                  ₹{Number(top1.total_earned || 0).toFixed(0)}
                </span>
                <div className="w-full h-28 rounded-t-2xl bg-gradient-to-t from-amber-500/20 via-slate-900 to-slate-800 border-t-2 border-x border-amber-400/50 mt-2 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            ) : <div />}

            {/* Rank 3 (Bronze) */}
            {top3 ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <UserAvatar
                    src={top3.avatar_url}
                    name={top3.display_name}
                    size="md"
                    className="border-amber-700"
                  />
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-[10px] shadow">
                    3
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-200 truncate max-w-[80px] text-center block mt-1">
                  {top3.display_name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-xs font-extrabold text-amber-600 font-heading">
                  ₹{Number(top3.total_earned || 0).toFixed(0)}
                </span>
                <div className="w-full h-16 rounded-t-2xl bg-gradient-to-t from-slate-900 to-slate-800 border-t border-x border-slate-700/60 mt-2 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-700" />
                </div>
              </div>
            ) : <div />}
          </div>

          {/* Rest of the Top 50 List */}
          <div className="space-y-2 mt-4">
            {restLeaders.map((lead, idx) => {
              const rank = idx + 4
              const isCurrentUser = user && user.id === lead.id
              return (
                <div
                  key={lead.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrentUser
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 font-mono font-bold text-xs text-slate-500 text-center shrink-0">
                      #{rank}
                    </span>
                    <UserAvatar
                      src={lead.avatar_url}
                      name={lead.display_name}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-200 block truncate font-heading">
                        {lead.display_name}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Verified Member
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-emerald-400 font-heading shrink-0">
                    ₹{Number(lead.total_earned || 0).toFixed(0)}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          No records yet. Be the first to earn and lead the board!
        </div>
      )}
    </div>
  )
}
