import React from 'react'
import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { sound } from '../lib/audio'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
          Error 404
        </span>
        <h1 className="text-2xl font-bold font-heading text-slate-100 mb-2">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The screen you are looking for does not exist or has been relocated.
        </p>

        <Link
          to="/"
          onClick={() => sound.playPop()}
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
