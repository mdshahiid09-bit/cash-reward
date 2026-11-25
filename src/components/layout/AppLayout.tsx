import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'
import { useAuth } from '../../context/AuthContext'
import { useOffline } from '../../hooks/useOffline'
import { BlockedScreen } from '../modals/BlockedScreen'
import { MaintenanceScreen } from '../modals/MaintenanceScreen'
import { WelcomeModal } from '../modals/WelcomeModal'
import { WifiOff, Coins } from 'lucide-react'

export const AppLayout: React.FC = () => {
  const { user, profile, loading, siteSettings, showWelcomeModal, closeWelcomeModal, welcomeBonusAmount } = useAuth()
  const isOffline = useOffline()
  const location = useLocation()

  // 1. Initial Authentication & Profile Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4 animate-bounce">
          <Coins className="w-7 h-7 text-slate-950 fill-slate-950" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Cash Reward...</span>
        </div>
      </div>
    )
  }

  // 2. Unauthenticated check: Redirect directly to Auth Landing page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Maintenance Mode Check
  if (siteSettings?.maintenance_mode) {
    return <MaintenanceScreen />
  }

  // 4. Blocked User Check
  if (profile?.blocked) {
    return <BlockedScreen />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center antialiased selection:bg-emerald-500 selection:text-slate-950 relative">
      {/* Background ambient light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-80 bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none" />

      {/* Offline Alert Bar */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 shadow-lg">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>You are currently offline. Please check your internet connection.</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Native Mobile App Container */}
      <main className="w-full max-w-lg mx-auto p-4 sm:p-5 pb-28 min-h-[calc(100vh-60px)]">
        <Outlet />
      </main>

      {/* Floating Bottom App Navigation */}
      <BottomNav />

      {/* Welcome Bonus Modal on First Login */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        bonusAmount={welcomeBonusAmount}
        onClose={closeWelcomeModal}
      />
    </div>
  )
}
