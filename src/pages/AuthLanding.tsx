import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Users, 
  Gift, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Wallet,
  Lock,
  RefreshCw,
  ExternalLink,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sound } from '../lib/audio'

export const AuthLanding: React.FC = () => {
  const { 
    user, 
    loading, 
    signInWithGoogle, 
    authError, 
    authErrorDetails, 
    clearAuthError, 
    welcomeBonusAmount 
  } = useAuth()
  
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [referralCode, setReferralCode] = useState('')
  const [showReferralInput, setShowReferralInput] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  // Check URL for referral code parameter
  useEffect(() => {
    const refParam = searchParams.get('ref')
    if (refParam) {
      setReferralCode(refParam.toUpperCase())
      setShowReferralInput(true)
    }
  }, [searchParams])

  const handleGoogleSignIn = async () => {
    clearAuthError()
    setIsSigningIn(true)
    sound.playPop()
    try {
      await signInWithGoogle(referralCode)
    } catch {
      setIsSigningIn(false)
    }
  }

  const isOrgInternalError = 
    authError?.toLowerCase().includes('org_internal') ||
    authError?.toLowerCase().includes('organization') ||
    authError?.toLowerCase().includes('access_denied') ||
    authErrorDetails?.errorDescription?.toLowerCase().includes('org_internal')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Coins className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Cash Reward
            </span>
            <span className="block text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
              Official User Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Verified Payouts</span>
        </div>
      </header>

      {/* Main Hero & Auth Section */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 py-6 md:py-12 flex flex-col items-center text-center">
        {/* Welcome Bonus Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold mb-6 shadow-sm"
        >
          <Sparkles className="w-4 h-4 animate-spin text-emerald-300" style={{ animationDuration: '4s' }} />
          <span>Instant ₹{welcomeBonusAmount} Welcome Bonus on First Sign-In!</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] max-w-3xl mb-4"
        >
          Complete Simple Tasks,{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Earn Real Cash
          </span>{' '}
          Daily.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl mb-8 leading-relaxed"
        >
          Download apps, complete quick steps, and withdraw your rewards directly to your 
          <span className="text-slate-200 font-medium"> UPI (GPay, PhonePe, Paytm)</span>, Bank Account, or Google Play Redeem Code.
        </motion.p>

        {/* Detailed Google OAuth Error Screen & Diagnostics */}
        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg mb-8 p-5 sm:p-6 rounded-3xl bg-slate-900/95 border-2 border-rose-500/40 text-rose-300 text-left shadow-2xl backdrop-blur-xl relative"
            >
              {/* Top Banner Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-rose-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white">Google Sign-In Failed</h2>
                    <p className="text-[11px] text-rose-300/80">OAuth Authentication Error from Google</p>
                  </div>
                </div>
                <button 
                  onClick={clearAuthError}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Dismiss error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Exact Error Details from URL Params */}
              <div className="mt-3.5 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Diagnosis & Error Text:
                </span>
                <div className="p-3 bg-slate-950/90 border border-rose-900/60 rounded-xl font-mono text-xs text-rose-200 break-words select-all leading-relaxed shadow-inner">
                  {authErrorDetails?.errorCode && (
                    <div className="text-[10px] text-rose-400/90 mb-1 font-semibold">
                      CODE: {authErrorDetails.errorCode}
                    </div>
                  )}
                  {authErrorDetails?.errorDescription || authError}
                </div>

                {isOrgInternalError && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                      <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Resolution for Error 403 (org_internal):</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-normal">
                      The OAuth consent screen in Google Cloud Console must be set to <strong>User Type: External</strong>, and your Google email must be added under <strong>Test users</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Retry and Google Help */}
              <div className="mt-5 pt-3.5 border-t border-slate-800 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSigningIn ? 'animate-spin' : ''}`} />
                  <span>{isSigningIn ? 'Retrying...' : 'Retry Sign In'}</span>
                </button>

                <a
                  href="https://support.google.com/accounts/answer/12921413"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Google Sign-in Help</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-md bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative"
        >
          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-white/5 active:scale-[0.98] transition-all duration-200 disabled:opacity-75 disabled:pointer-events-none cursor-pointer group"
          >
            {isSigningIn ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">Connecting to Google...</span>
              </div>
            ) : (
              <>
                {/* Official Google G Logo SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span className="text-base font-bold tracking-tight">Continue with Google</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Referral Code Expandable Input */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            {!showReferralInput ? (
              <button
                type="button"
                onClick={() => setShowReferralInput(true)}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1.5 w-full transition-colors"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Have a referral code? Enter here</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 text-left"
              >
                <label className="text-xs font-medium text-slate-400 block">
                  Friend's Referral Code (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CR9821AB"
                    maxLength={12}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 uppercase tracking-wider font-mono placeholder:text-slate-600 outline-none transition-colors"
                  />
                  {referralCode && (
                    <span className="absolute right-3 top-3 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <p className="mt-4 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>Secure 256-bit SSL encrypted authentication</span>
          </p>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full text-left">
          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2.5">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-200">Instant Bonus</h2>
            <p className="text-xs text-slate-400 mt-1">₹{welcomeBonusAmount} credited as soon as you sign in.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-2.5">
              <Wallet className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-200">Fast UPI Payouts</h2>
            <p className="text-xs text-slate-400 mt-1">Direct transfer to your UPI or Bank within 24h.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2.5">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-200">Refer & Earn</h2>
            <p className="text-xs text-slate-400 mt-1">Invite friends and earn ₹10 per active friend.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl hover:border-slate-700 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-200">100% Free</h2>
            <p className="text-xs text-slate-400 mt-1">Zero investment or credit card required.</p>
          </div>
        </div>
      </main>

      {/* Footer Links */}
      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Cash Reward. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/p/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link to="/p/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/p/about" className="hover:text-slate-300 transition-colors">About Us</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
