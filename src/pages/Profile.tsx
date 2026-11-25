import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Camera,
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
  ExternalLink
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme, PRESET_ACCENTS } from '../context/ThemeContext'
import { Modal } from '../components/common/Modal'
import { ConfirmModal } from '../components/modals/ConfirmModal'
import { sound } from '../lib/audio'

export const Profile: React.FC = () => {
  const { user, profile, refreshProfile, signOut, deleteAccount, signInWithGoogle } = useAuth()
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme()

  // Display Name editing
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  // Avatar upload
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Photo must be under 5 MB')
      return
    }

    setIsUploadingAvatar(true)
    setAvatarError(null)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const filePath = `${user.id}/avatar_${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (upErr) throw upErr

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)

      sound.playSuccess()
      await refreshProfile()
    } catch (err: unknown) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploadingAvatar(false)
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
      setContactMessage('')
      setTimeout(() => {
        setMessageSent(false)
        setShowContactModal(false)
      }, 2000)
    } finally {
      setIsSendingMessage(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-3xl p-10 bg-slate-900 border border-slate-800 text-center max-w-md mx-auto my-12">
        <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold font-heading mb-2 text-slate-100">Profile & Settings</h2>
        <p className="text-xs text-slate-400 mb-6">
          Sign in to customize your appearance, check referral earnings, and manage your account.
        </p>
        <button
          onClick={() => {
            sound.playPop()
            signInWithGoogle()
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
        >
          Sign In with Google
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100 mb-1">
          Account & Preferences
        </h1>
        <p className="text-sm text-slate-400">
          Manage your personal details, visual theme, and support channels.
        </p>
      </div>

      {/* Avatar & Display Name Card */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Upload */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-800 border-2 border-emerald-500/50 shadow-md">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>

            <label className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg transition-transform active:scale-95">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </label>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold font-heading text-slate-100">
              {profile?.display_name || 'Member'}
            </h2>
            <span className="text-xs text-slate-400 block mt-0.5">{user.email}</span>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                Code: {profile?.referral_code}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Verified Account ✓
              </span>
            </div>
            {avatarError && <p className="text-xs text-rose-400 mt-2">{avatarError}</p>}
          </div>
        </div>

        {/* Edit Display Name Form */}
        <form onSubmit={handleSaveDisplayName} className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Change your display name"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            required
          />
          <button
            type="submit"
            disabled={isSavingName}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
          >
            {isSavingName ? 'Saving...' : nameSuccess ? 'Saved ✓' : 'Update Name'}
          </button>
        </form>
      </div>

      {/* Customization (Theme & Accent Color) */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-6 shadow-md">
        <h3 className="text-base font-bold font-heading text-slate-200 flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-400" />
          Appearance & Themes
        </h3>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div>
            <span className="text-sm font-bold text-slate-200 block font-heading">
              Application Theme
            </span>
            <span className="text-xs text-slate-400">
              Current mode: <strong className="capitalize">{theme}</strong>
            </span>
          </div>

          <button
            onClick={() => {
              sound.playPop()
              toggleTheme()
            }}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-2"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span className="text-xs font-semibold capitalize">{theme}</span>
          </button>
        </div>

        {/* Accent Colors */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 block">
            Choose Accent Color
          </span>
          <div className="flex items-center gap-3">
            {PRESET_ACCENTS.map(color => (
              <button
                key={color}
                onClick={() => {
                  sound.playPop()
                  setAccentColor(color)
                }}
                style={{ backgroundColor: color }}
                className={`w-9 h-9 rounded-2xl transition-all ${
                  accentColor === color ? 'ring-4 ring-white/30 scale-110 shadow-lg' : 'opacity-80 hover:opacity-100'
                }`}
                aria-label={`Select accent color ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pages & Support Section */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <h3 className="text-base font-bold font-heading text-slate-200 flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-teal-400" />
          Help & Legal
        </h3>

        <div className="space-y-2">
          <Link
            to="/p/about"
            onClick={() => sound.playPop()}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>About Cash Reward</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </Link>

          <Link
            to="/p/terms"
            onClick={() => sound.playPop()}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Terms & Conditions</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </Link>

          <Link
            to="/p/privacy"
            onClick={() => sound.playPop()}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Privacy Policy</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </Link>

          <button
            onClick={() => {
              sound.playPop()
              setShowContactModal(true)
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Contact Support & Official Channels</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Account Danger Actions */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-3 shadow-md">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        <button
          onClick={() => {
            sound.playPop()
            setShowDeleteModal(true)
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Account Permanently</span>
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? All remaining wallet balance and submissions will be forfeited and your account anonymized."
        confirmText="Yes, Delete My Account"
        isDestructive={true}
        onConfirm={deleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Contact Support Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Support"
      >
        <div className="space-y-5">
          {/* Quick Channels */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="mailto:support@cashreward.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playPop()}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center gap-2.5 text-xs font-bold text-slate-200 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Email Support</span>
            </a>
            <a
              href="https://t.me/cashreward_official"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playPop()}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 flex items-center gap-2.5 text-xs font-bold text-slate-200 transition-colors"
            >
              <Send className="w-4 h-4 text-teal-400" />
              <span>Telegram Channel</span>
            </a>
          </div>

          {/* In-App Message Form */}
          <form onSubmit={handleSendMessage} className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-heading">
              Send us a direct message
            </span>
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              required
            />
            <input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              required
            />
            <textarea
              rows={3}
              value={contactMessage}
              onChange={e => setContactMessage(e.target.value)}
              placeholder="Describe your issue or query..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
              required
            />

            {messageSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Message sent successfully! We will get back soon.
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSendingMessage}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
              >
                {isSendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            )}
          </form>
        </div>
      </Modal>
    </div>
  )
}
