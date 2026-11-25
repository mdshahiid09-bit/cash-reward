import React from 'react'

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl p-4 border border-slate-800 bg-slate-900/60 animate-shimmer"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-800/80 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800/80 rounded w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            </div>
            <div className="w-16 h-8 bg-slate-800/80 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export const BannerSkeleton: React.FC = () => {
  return (
    <div className="w-full h-44 sm:h-56 rounded-2xl bg-slate-800/80 animate-shimmer border border-slate-800" />
  )
}
