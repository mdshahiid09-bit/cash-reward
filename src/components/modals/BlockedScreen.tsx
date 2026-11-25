import React from 'react'
import { ShieldAlert, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const BlockedScreen: React.FC = () => {
  const { signOut } = useAuth()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold font-heading mb-2 text-rose-400">
          Account Suspended
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Your Cash Reward account has been suspended by administration due to a violation of our terms, fraud detection, or multiple account usage.
        </p>

        <button
          onClick={signOut}
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of Account
        </button>
      </div>
    </div>
  )
}
