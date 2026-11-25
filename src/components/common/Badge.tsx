import React from 'react'
import { Flame, Sparkles, Clock, Star } from 'lucide-react'

interface BadgeProps {
  type?: 'hot' | 'exclusive' | 'new' | 'limited' | string
  badge?: 'hot' | 'exclusive' | 'new' | 'limited' | string
  variant?: 'hot' | 'exclusive' | 'new' | 'limited' | string
  text?: string
}

export const Badge: React.FC<BadgeProps> = ({ type, badge, variant, text }) => {
  const kind = (type || badge || variant || 'new').toLowerCase()

  switch (kind) {
    case 'hot':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
          {text || 'Hot Offer'}
        </span>
      )
    case 'exclusive':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Star className="w-3 h-3 text-amber-400" />
          {text || 'Exclusive'}
        </span>
      )
    case 'limited':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
          <Clock className="w-3 h-3 text-indigo-400" />
          {text || 'Limited Time'}
        </span>
      )
    case 'new':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          {text || 'New'}
        </span>
      )
  }
}

export const TaskBadge = Badge
