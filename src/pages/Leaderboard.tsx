import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Award, Crown, User, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Profile } from '../types'
import { useAuth } from '../context/AuthContext'
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
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-2">
          <Crown className="w-3.5 h-3.5" /> Hall of Fame
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-100 mb-1">
          Top Earners Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Ranked by verified lifetime task earnings. Compete and claim your spot on the podium!
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-48 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      ) : leaders.length > 0 ? (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4">
            {/* Rank 2 (Silver) */}
            {top2 ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-slate-300 bg-slate-800 shadow-lg">
                    {top2.avatar_url ? (
                      <img src={top2.avatar_url} alt={top2.display_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow">
                    2
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-200 truncate max-w-[80px] sm:max-w-none text-center block mt-1">
                  {top2.display_name}
                </span>
                <span className="text-xs font-extrabold text-slate-300 font-heading">
                  ₹{Number(top2.total_earned || 0).toFixed(0)}
                </span>
                <div className="w-full h-24 sm:h-32 rounded-t-3xl bg-gradient-to-t from-slate-900 to-slate-800 border-t border-x border-slate-700/60 mt-3 flex items-center justify-center">
                  <Medal className="w-6 h-6 text-slate-300" />
                </div>
              </div>
            ) : <div />}

            {/* Rank 1 (Gold) */}
            {top1 ? (
              <div className="flex flex-col items-center -mt-6">
                <div className="relative mb-2">
                  <Crown className="w-8 h-8 text-amber-400 absolute -top-7 left-1/2 -translate-x-1/2 drop-shadow-md animate-bounce" />
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-amber-400 bg-slate-800 shadow-xl shadow-amber-500/20">
                    {top1.avatar_url ? (
                      <img src={top1.avatar_url} alt={top1.display_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-xs shadow-md">
                    1
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-100 truncate max-w-[90px] sm:max-w-none text-center block mt-1">
                  {top1.display_name}
                </span>
                <span className="text-sm font-extrabold text-amber-400 font-heading">
                  ₹{Number(top1.total_earned || 0).toFixed(0)}
                </span>
                <div className="w-full h-32 sm:h-44 rounded-t-3xl bg-gradient-to-t from-amber-950/40 via-slate-900 to-slate-800 border-t-2 border-x-2 border-amber-400/80 mt-3 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            ) : <div />}

            {/* Rank 3 (Bronze) */}
            {top3 ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-700 bg-slate-800 shadow-lg">
                    {top3.avatar_url ? (
                      <img src={top3.avatar_url} alt={top3.display_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-extrabold text-xs shadow">
                    3
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-200 truncate max-w-[80px] sm:max-w-none text-center block mt-1">
                  {top3.display_name}
                </span>
                <span className="text-xs font-extrabold text-amber-600 font-heading">
                  ₹{Number(top3.total_earned || 0).toFixed(0)}
                </span>
                <div className="w-full h-20 sm:h-28 rounded-t-3xl bg-gradient-to-t from-slate-900 to-slate-800 border-t border-x border-slate-700/60 mt-3 flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-700" />
                </div>
              </div>
            ) : <div />}
          </div>

          {/* Ranks 4 to 50 List */}
          {restLeaders.length > 0 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 space-y-2 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-2 font-heading">
                Top 50 Ranking
              </h3>

              {restLeaders.map((leader, idx) => {
                const rank = idx + 4
                const isCurrentUser = user && leader.id === user.id
                return (
                  <div
                    key={leader.id}
                    className={`p-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all ${
                      isCurrentUser
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-center text-xs font-mono font-bold text-slate-500">
                        #{rank}
                      </span>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                        {leader.avatar_url ? (
                          <img src={leader.avatar_url} alt={leader.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-slate-200 block truncate font-heading">
                          {leader.display_name} {isCurrentUser && '(You)'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Member since {new Date(leader.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 font-heading font-extrabold text-sm text-emerald-400">
                      ₹{Number(leader.total_earned || 0).toFixed(0)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-3xl p-12 bg-slate-900 border border-slate-800 text-center">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No ranked users yet. Be the first to earn and lead the board!</p>
        </div>
      )}
    </div>
  )
}
