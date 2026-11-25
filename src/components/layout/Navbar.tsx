import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, Sparkles, LogIn, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { UserAvatar } from '../common/UserAvatar'
import { sound } from '../../lib/audio'

export const Navbar: React.FC = () => {
  const { user, profile, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const avatarSrc = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => sound.playPop()}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-base tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Cash Reward
            </span>
            <span className="text-[9px] text-slate-400 font-semibold -mt-1 tracking-wider uppercase">
              Micro Earning
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {user && profile ? (
            <>
              {/* Wallet Balance Pill */}
              <button
                onClick={() => {
                  sound.playPop()
                  navigate('/wallet')
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/40 hover:border-emerald-500 transition-colors shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-3 h-3" />
                </div>
                <span className="text-xs font-black text-emerald-400 font-heading">
                  ₹{Number(profile.balance || 0).toFixed(0)}
                </span>
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

              {/* Profile Avatar: Google photo or initial badge (No broken images, No edit button) */}
              <Link
                to="/profile"
                onClick={() => sound.playPop()}
                className="flex items-center"
              >
                <UserAvatar
                  src={avatarSrc}
                  name={profile.display_name || user?.user_metadata?.full_name}
                  size="sm"
                  className="hover:scale-105 transition-transform"
                />
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                sound.playPop()
                signInWithGoogle()
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
