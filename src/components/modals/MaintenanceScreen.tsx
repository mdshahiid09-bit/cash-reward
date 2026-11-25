import React from 'react'
import { Wrench } from 'lucide-react'

export const MaintenanceScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-pulse">
          <Wrench className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold font-heading mb-2 text-amber-400">
          Scheduled Maintenance
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          Cash Reward is currently undergoing routine system maintenance and server upgrades. We will be back online shortly. Thank you for your patience!
        </p>

        <div className="text-xs text-slate-500 font-mono">
          Status: Engine Update in progress
        </div>
      </div>
    </div>
  )
}
