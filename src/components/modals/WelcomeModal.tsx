import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles } from 'lucide-react'
import { sound } from '../../lib/audio'

interface WelcomeModalProps {
  isOpen: boolean
  bonusAmount: number
  onClose: () => void
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, bonusAmount, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      sound.playSuccess()
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 p-6 text-center text-slate-100 shadow-2xl overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10">
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <Gift className="w-10 h-10 text-white" />
            </motion.div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Welcome Gift
            </span>

            <h2 className="text-2xl font-bold font-heading mb-1">Welcome Bonus!</h2>
            <p className="text-sm text-slate-400 mb-6">
              Thank you for joining Cash Reward. Your account has been credited with an instant signup bonus.
            </p>

            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 mb-6">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Credited to Balance
              </span>
              <span className="text-4xl font-extrabold text-emerald-400 font-heading">
                ₹{bonusAmount}
              </span>
            </div>

            <button
              onClick={() => {
                sound.playPop()
                onClose()
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              Claim & Explore Tasks
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
