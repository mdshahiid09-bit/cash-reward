import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLanding } from './pages/AuthLanding'
import { Home } from './pages/Home'
import { Offers } from './pages/Offers'
import { TaskDetail } from './pages/TaskDetail'
import { Wallet } from './pages/Wallet'
import { History } from './pages/History'
import { Leaderboard } from './pages/Leaderboard'
import { ReferAndEarn } from './pages/ReferAndEarn'
import { Profile } from './pages/Profile'
import { InfoPage } from './pages/InfoPage'
import { NotFound } from './pages/NotFound'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Landing Route */}
        <Route path="/login" element={<AuthLanding />} />

        {/* Public Information Pages (Accessible with or without login) */}
        <Route
          path="/p/:slug"
          element={
            <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
              <InfoPage />
            </div>
          }
        />

        {/* Protected Application Routes (Requires Authentication) */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="offers" element={<Offers />} />
          <Route path="offers/:id" element={<TaskDetail />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="history" element={<History />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="refer" element={<ReferAndEarn />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
