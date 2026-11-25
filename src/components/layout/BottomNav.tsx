import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Flame, Wallet, Clock, User } from 'lucide-react'
import { sound } from '../../lib/audio'

export const BottomNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Offers', path: '/offers', icon: Flame },
    { label: 'Wallet', path: '/wallet', icon: Wallet },
    { label: 'History', path: '/history', icon: Clock },
    { label: 'Profile', path: '/profile', icon: User }
  ]

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-1.5 shadow-2xl shadow-black/80">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => sound.playPop()}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-400 font-extrabold bg-emerald-500/15 border border-emerald-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-[10px] font-semibold tracking-tight mt-0.5">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
