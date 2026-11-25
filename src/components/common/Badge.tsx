import React from 'react'
import { Flame, Sparkles, Clock, Star } from 'lucide-react'

interface BadgeProps {
  type: 'hot' | 'exclusive' | 'new' | 'limited'
}

export const TaskBadge: React.FC<BadgeProps> = ({ type }) => {
  switch (type) {
    case 'hot':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
          Hot Offer
        </span>
      )
    case 'exclusive':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Star className="w-3 h-3 text-amber-400" />
          Exclusive
        </span>
      )
    case 'new':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          New
        </span>
      )
    case 'limited':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
          <Clock className="w-3 h-3 text-indigo-400" />
          Limited Time
        </span>
      )
  }
}
