import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import { useOffline } from '../../hooks/useOffline'
import { BlockedScreen } from '../modals/BlockedScreen'
import { MaintenanceScreen } from '../modals/MaintenanceScreen'
import { WelcomeModal } from '../modals/WelcomeModal'
import { WifiOff } from 'lucide-react'

export const AppLayout: React.FC = () => {
  const { profile, siteSettings, showWelcomeModal, closeWelcomeModal, welcomeBonusAmount } = useAuth()
  const isOffline = useOffline()

  // 1. Maintenance Mode Check
  if (siteSettings?.maintenance_mode) {
    return <MaintenanceScreen />
  }

  // 2. Blocked User Check
  if (profile?.blocked) {
    return <BlockedScreen />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Offline Alert Bar */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 shadow-lg">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>You are currently offline. Please check your internet connection.</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
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
