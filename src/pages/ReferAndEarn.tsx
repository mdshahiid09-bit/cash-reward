import React, { useState, useEffect } from 'react'
import {
  Users,
  Copy,
  Share2,
  Check,
  Gift,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Referral } from '../types'
import { useAuth } from '../context/AuthContext'
import { sound } from '../lib/audio'

export const ReferAndEarn: React.FC = () => {
  const { user, profile, siteSettings, signInWithGoogle } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [loading, setLoading] = useState(true)

  const referralReward = siteSettings?.referral_reward || 10
  const referralCode = profile?.referral_code || 'CRDEMO'
  const referralLink = `${window.location.origin}/?ref=${referralCode}`

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const loadReferrals = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('referrals')
          .select('*, referee:profiles!referrals_referred_id_fkey(display_name, avatar_url, created_at)')
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false })

        setReferrals((data as Referral[]) || [])
      } finally {
        setLoading(false)
      }
    }

    loadReferrals()
  }, [user])

  const handleCopyCode = () => {
    sound.playPop()
    navigator.clipboard.writeText(referralCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleShareLink = async () => {
    sound.playPop()
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cash Reward - Earn Real Cash',
          text: `Join Cash Reward using my invite code ${referralCode} and get instant signup bonus!`,
          url: referralLink
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (!user) {
    return (
      <div className="rounded-3xl p-10 bg-slate-900 border border-slate-800 text-center max-w-md mx-auto my-12">
        <Users className="w-12 h-12 text-teal-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold font-heading mb-2 text-slate-100">Sign In to Invite Friends</h2>
        <p className="text-xs text-slate-400 mb-6">
          Generate your unique referral link, invite friends, and earn ₹{referralReward} on their first verified task!
        </p>
        <button
          onClick={() => {
            sound.playPop()
            signInWithGoogle()
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20"
        >
          Sign In with Google
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Hero Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-950 border border-teal-500/40 shadow-xl overflow-hidden">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/40 mb-3">
            <Gift className="w-3.5 h-3.5" /> Refer & Earn Program
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-100 mb-2">
            Invite Friends, Earn <span className="text-teal-400">₹{referralReward}</span> Cash!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Share your personal invite link. When your friend signs up and completes their first task, you both get instant wallet rewards!
          </p>
        </div>
      </div>

      {/* Referral Code & Share Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Code Box */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-heading">
            Your Referral Code
          </span>
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-mono text-xl font-extrabold tracking-widest text-emerald-400">
              {referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              aria-label="Copy referral code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {copiedCode ? 'Code copied to clipboard!' : 'Tap the copy icon to copy your code.'}
          </span>
        </div>

        {/* Share Link Box */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-heading mb-1">
              Share Direct Invite Link
            </span>
            <p className="text-xs text-slate-400">
              Directly launch WhatsApp, Telegram, or social media share sheet.
            </p>
          </div>

          <button
            onClick={handleShareLink}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share Referral Link'}</span>
          </button>
        </div>
      </div>

      {/* Referral Statistics & List */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading text-slate-100">
            Invited Friends ({referrals.length})
          </h3>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ₹{referrals.filter(r => r.reward_paid).length * referralReward} Earned
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-slate-950 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : referrals.length > 0 ? (
          <div className="space-y-3">
            {referrals.map(ref => (
              <div
                key={ref.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <UserCheck className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-200 block font-heading">
                      {ref.referee?.display_name || 'Invited User'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Joined on {new Date(ref.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    ref.reward_paid
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {ref.reward_paid ? 'Reward Paid (+₹10)' : 'Pending 1st Task'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-8 bg-slate-950/40 border border-slate-800 text-center">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">You haven't referred any friends yet. Share your code to start earning!</p>
          </div>
        )}
      </div>
    </div>
  )
}
