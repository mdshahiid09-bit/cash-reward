import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, Sparkles, User, LogIn, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { sound } from '../../lib/audio'

export const Navbar: React.FC = () => {
  const { user, profile, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => sound.playPop()}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Cash Reward
            </span>
            <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
              Micro Earning
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user && profile ? (
            <>
              {/* Wallet Pill */}
              <button
                onClick={() => {
                  sound.playPop()
                  navigate('/wallet')
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/40 hover:border-emerald-500 transition-colors shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left pr-1">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold leading-none">
                    Balance
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400 font-heading leading-tight">
                    ₹{Number(profile.balance || 0).toFixed(0)}
                  </span>
                </div>
              </button>

              {/* Notification icon link */}
              <button
                onClick={() => {
                  sound.playPop()
                  navigate('/wallet#notifications')
                }}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Avatar Link */}
              <Link
                to="/profile"
                onClick={() => sound.playPop()}
                className="flex items-center"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/50 hover:border-emerald-400 transition-colors"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                sound.playPop()
                signInWithGoogle()
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Google Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
