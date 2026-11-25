import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  Home,
  Layers,
  Wallet,
  History,
  Trophy,
  Users,
  User,
  Info,
  ShieldCheck,
  Headphones,
  Sparkles
} from 'lucide-react'
import { sound } from '../../lib/audio'

export const Sidebar: React.FC = () => {
  const mainLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Offers & Tasks', path: '/offers', icon: Layers },
    { label: 'Wallet & Payouts', path: '/wallet', icon: Wallet },
    { label: 'Task History', path: '/history', icon: History },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Refer & Earn', path: '/refer', icon: Users },
    { label: 'My Profile', path: '/profile', icon: User }
  ]

  const infoLinks = [
    { label: 'About Us', path: '/p/about', icon: Info },
    { label: 'Terms & Rules', path: '/p/terms', icon: ShieldCheck },
    { label: 'Contact Support', path: '/profile#contact', icon: Headphones }
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-slate-950 border-r border-slate-800/80 p-5 flex-shrink-0">
      {/* Brand */}
      <Link
        to="/"
        onClick={() => sound.playPop()}
        className="flex items-center gap-3 mb-8 px-2 group"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <span className="font-heading font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent block">
            Cash Reward
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block -mt-1">
            User Portal
          </span>
        </div>
      </Link>

      {/* Main Nav */}
      <div className="space-y-1 mb-8 flex-1">
        <span className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider block mb-2">
          Navigation
        </span>
        {mainLinks.map(link => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => sound.playPop()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          )
        })}

        <span className="text-[10px] uppercase font-bold text-slate-500 px-3 tracking-wider block pt-6 mb-2">
          Information
        </span>
        {infoLinks.map(link => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => sound.playPop()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-2xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
        <span className="text-xs text-slate-400 block font-medium">100% Verified Payouts</span>
        <span className="text-[10px] text-slate-500 block mt-0.5">UPI • Bank • Google Play</span>
      </div>
    </aside>
  )
}
