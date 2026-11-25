import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
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
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="offers" element={<Offers />} />
          <Route path="offers/:id" element={<TaskDetail />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="history" element={<History />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="refer" element={<ReferAndEarn />} />
          <Route path="profile" element={<Profile />} />
          <Route path="p/:slug" element={<InfoPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
