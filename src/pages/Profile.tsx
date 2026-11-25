import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun,
  Moon,
  Palette,
  Trash2,
  LogOut,
  Mail,
  Send,
  MessageSquare,
  HelpCircle,
  FileText,
  Shield,
  Info,
  CheckCircle2,
  ExternalLink,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme, PRESET_ACCENTS } from '../context/ThemeContext'
import { UserAvatar } from '../components/common/UserAvatar'
import { Modal } from '../components/common/Modal'
import { ConfirmModal } from '../components/modals/ConfirmModal'
import { sound } from '../lib/audio'

export const Profile: React.FC = () => {
  const { user, profile, refreshProfile, signOut, deleteAccount } = useAuth()
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme()

  // Display Name editing
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

  // Contact Form
  const [contactName, setContactName] = useState(profile?.display_name || '')
  const [contactEmail, setContactEmail] = useState(user?.email || '')
  const [contactMessage, setContactMessage] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !displayName.trim()) return
    setIsSavingName(true)
    setNameSuccess(false)
    try {
      await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user.id)

      sound.playSuccess()
      setNameSuccess(true)
      await refreshProfile()
      setTimeout(() => setNameSuccess(false), 2500)
    } finally {
      setIsSavingName(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactMessage.trim()) return
    setIsSendingMessage(true)
    try {
      await supabase.from('contact_messages').insert({
        user_id: user?.id || null,
        name: contactName.trim(),
        email: contactEmail.trim(),
        message: contactMessage.trim()
      })
      sound.playSuccess()
      setMessageSent(true)
      setTimeout(() => {
        setMessageSent(false)
        setShowContactModal(false)
        setContactMessage('')
      }, 2000)
    } catch {
      // Message error
    } finally {
      setIsSendingMessage(false)
    }
  }

  const avatarSrc = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24">
      {/* Profile Header Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left">
          {/* User Avatar: Google image with fallback to initial letter badge (No edit DP option) */}
          <UserAvatar
            src={avatarSrc}
            name={profile?.display_name || user?.user_metadata?.full_name}
            size="xl"
            className="ring-4 ring-emerald-500/20"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-white font-heading truncate">
                {profile?.display_name || user?.user_metadata?.full_name || 'User'}
              </h1>
              <span className="p-1 rounded-full bg-emerald-500/15 text-emerald-400" title="Google Verified Account">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <p className="text-xs text-slate-400 truncate font-mono">
              {user?.email}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-semibold text-emerald-400 font-mono">
                Ref Code: {profile?.referral_code || 'N/A'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                Google SSO Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Earnings Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Wallet Balance
            </span>
            <span className="text-lg font-black text-emerald-400 font-heading">
              ₹{Number(profile?.balance || 0).toFixed(0)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Total Earned
            </span>
            <span className="text-lg font-black text-teal-400 font-heading">
              ₹{Number(profile?.total_earned || 0).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Display Name */}
      <div className="rounded-3xl p-5 sm:p-6 bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-200 font-heading">
          Edit Display Name
        </h2>

        <form onSubmit={handleSaveDisplayName} className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            maxLength={32}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isSavingName || !displayName.trim()}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSavingName ? 'Saving...' : nameSuccess ? 'Saved!' : 'Save'}
          </button>
        </form>
      </div>

      {/* Appearance & Themes */}
      <div className="rounded-3xl p-5 sm:p-6 bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-200 font-heading flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-400" />
          <span>App Appearance</span>
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <span className="text-xs font-bold text-slate-200 block">Theme Mode</span>
              <span className="text-[11px] text-slate-400 capitalize">{theme} theme active</span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playPop()
              toggleTheme()
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Accent Colors */}
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-2.5">
            Accent Color
          </span>
          <div className="flex items-center gap-3">
            {PRESET_ACCENTS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  sound.playPop()
                  setAccentColor(color)
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  accentColor.toLowerCase() === color.toLowerCase()
                    ? 'ring-2 ring-white scale-110 shadow-lg'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              >
                {accentColor.toLowerCase() === color.toLowerCase() && (
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Policies & Links */}
      <div className="rounded-3xl p-5 sm:p-6 bg-slate-900 border border-slate-800 shadow-xl space-y-2">
        <h2 className="text-sm font-bold text-slate-200 font-heading mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Support & Legal</span>
        </h2>

        <button
          onClick={() => {
            sound.playPop()
            setShowContactModal(true)
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Contact Us & Support</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </button>

        <Link
          to="/p/terms"
          onClick={() => sound.playPop()}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">Terms & Conditions</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </Link>

        <Link
          to="/p/privacy"
          onClick={() => sound.playPop()}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-semibold text-slate-200">Privacy Policy</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </Link>

        <Link
          to="/p/about"
          onClick={() => sound.playPop()}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-200">About Cash Reward</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </Link>
      </div>

      {/* Account Actions: Logout & Delete */}
      <div className="space-y-3">
        <button
          onClick={() => {
            sound.playPop()
            signOut()
          }}
          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>

        <button
          onClick={() => {
            sound.playPop()
            setShowDeleteModal(true)
          }}
          className="w-full py-3 rounded-2xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete My Account</span>
        </button>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Cash Reward Support"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <a
              href="mailto:support@cashreward.app"
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center gap-2.5 text-xs text-slate-300"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Email Support</span>
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center gap-2.5 text-xs text-slate-300"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 block">Send us an in-app message:</span>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
            />
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
            />
            <textarea
              rows={3}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Write your issue or inquiry..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isSendingMessage || !contactMessage.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingMessage ? 'Sending...' : messageSent ? 'Message Sent!' : 'Send Inquiry'}</span>
            </button>
          </form>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Account Permanently?"
        message="This action will delete your profile, anonymize your data, forfeit your remaining balance, and log you out. This action cannot be undone."
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={async () => {
          await deleteAccount()
          setShowDeleteModal(false)
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
