import React, { useState, useEffect } from 'react'
import {
  Wallet as WalletIcon,
  Plus,
  Trash2,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  Gift,
  Bell
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { supabase } from '../lib/supabase'
import { PaymentMethod, Withdrawal, NotificationItem } from '../types'
import { useAuth } from '../context/AuthContext'
import { Modal } from '../components/common/Modal'
import { ConfirmModal } from '../components/modals/ConfirmModal'
import { sound } from '../lib/audio'

export const Wallet: React.FC = () => {
  const { user, profile, refreshProfile, siteSettings, signInWithGoogle } = useAuth()

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  // Add Method Modal
  const [showAddMethodModal, setShowAddMethodModal] = useState(false)
  const [methodType, setMethodType] = useState<'upi' | 'bank' | 'redeem'>('upi')
  const [upiId, setUpiId] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [bankName, setBankName] = useState('')
  const [phone, setPhone] = useState('')
  const [redeemCodeInput, setRedeemCodeInput] = useState('')
  const [methodError, setMethodError] = useState<string | null>(null)

  // Delete Method Modal
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null)

  // Withdrawal Request Modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedMethodId, setSelectedMethodId] = useState<string>('')
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false)

  const minWithdraw = siteSettings?.withdraw_min || 50
  const maxWithdraw = siteSettings?.withdraw_max || 5000

  const loadWalletData = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // 1. Payment Methods
      const { data: pmData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setPaymentMethods(pmData || [])
      if (pmData && pmData.length > 0 && !selectedMethodId) {
        setSelectedMethodId(pmData[0].id)
      }

      // 2. Withdrawals
      const { data: wData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setWithdrawals(wData || [])

      // 3. Notifications
      const { data: nData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setNotifications(nData || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWalletData()
  }, [user])

  // Add Payment Method Handler
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setMethodError(null)

    let fields = {}
    if (methodType === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setMethodError('Please enter a valid UPI ID (e.g. yourname@upi)')
        return
      }
      fields = { upi_id: upiId.trim() }
    } else if (methodType === 'bank') {
      if (!accountNumber || accountNumber.length < 9) {
        setMethodError('Please enter a valid Bank Account Number')
        return
      }
      if (!ifsc || ifsc.length !== 11) {
        setMethodError('Please enter an 11-digit valid IFSC Code')
        return
      }
      if (!accountHolder) {
        setMethodError('Account Holder Name is required')
        return
      }
      fields = {
        account_number: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        account_holder: accountHolder.trim(),
        bank_name: bankName.trim(),
        phone: phone.trim()
      }
    } else if (methodType === 'redeem') {
      if (!redeemCodeInput) {
        setMethodError('Please enter Google Play Redeem email or phone')
        return
      }
      fields = { redeem_code: redeemCodeInput.trim() }
    }

    const { error: insertErr } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user.id,
        type: methodType,
        fields
      })

    if (insertErr) {
      setMethodError(insertErr.message)
    } else {
      sound.playSuccess()
      setShowAddMethodModal(false)
      // Reset form
      setUpiId('')
      setAccountNumber('')
      setIfsc('')
      setAccountHolder('')
      loadWalletData()
    }
  }

  // Delete Payment Method Handler
  const handleDeletePaymentMethod = async () => {
    if (!deleteMethodId) return
    await supabase.from('payment_methods').delete().eq('id', deleteMethodId)
    setDeleteMethodId(null)
    sound.playPop()
    loadWalletData()
  }

  // Withdrawal Request Handler
  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return
    setWithdrawError(null)

    const amount = Number(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Enter a valid withdrawal amount')
      return
    }
    if (amount < minWithdraw) {
      setWithdrawError(`Minimum withdrawal is ₹${minWithdraw}`)
      return
    }
    if (amount > maxWithdraw) {
      setWithdrawError(`Maximum withdrawal is ₹${maxWithdraw}`)
      return
    }
    if (amount > (profile.balance || 0)) {
      setWithdrawError('Insufficient wallet balance')
      return
    }
    if (!selectedMethodId) {
      setWithdrawError('Please select a payment destination')
      return
    }

    setIsSubmittingWithdraw(true)
    try {
      // 1. Create withdrawal request
      const { error: wErr } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount,
        method_id: selectedMethodId,
        status: 'pending'
      })
      if (wErr) throw wErr

      // 2. Debit balance
      const newBalance = (profile.balance || 0) - amount
      await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id)

      // 3. Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -amount,
        note: `Withdrawal request for ₹${amount}`
      })

      // 4. Create in-app notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Withdrawal Submitted',
        body: `Your payout request of ₹${amount} has been queued for verification.`
      })

      sound.playSuccess()
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } })
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      await refreshProfile()
      loadWalletData()
    } catch (err: unknown) {
      setWithdrawError(err instanceof Error ? err.message : 'Withdrawal failed')
    } finally {
      setIsSubmittingWithdraw(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-3xl p-10 bg-slate-900 border border-slate-800 text-center max-w-md mx-auto my-12">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center mb-4">
          <WalletIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-heading mb-2 text-slate-100">Sign In to View Wallet</h2>
        <p className="text-xs text-slate-400 mb-6">
          Track your real-time earnings, manage verified payment methods, and request instant withdrawals.
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
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Wallet Balance Hero Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-heading">
              <WalletIcon className="w-4 h-4 text-emerald-400" /> Current Available Balance
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-heading tracking-tight mt-1">
              ₹{Number(profile?.balance || 0).toFixed(0)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              Lifetime Earnings: ₹{Number(profile?.total_earned || 0).toFixed(0)} INR
            </span>
          </div>

          <button
            onClick={() => {
              sound.playPop()
              setShowWithdrawModal(true)
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Withdraw Cash</span>
          </button>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-100">
              Payment Methods
            </h3>
            <p className="text-xs text-slate-400">
              Link your UPI ID, Bank Account, or Redeem profile for withdrawals.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playPop()
              setShowAddMethodModal(true)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" /> Add Method
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0">
                    {method.type === 'upi' ? (
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                    ) : method.type === 'bank' ? (
                      <Building2 className="w-5 h-5 text-teal-400" />
                    ) : (
                      <Gift className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block font-heading">
                      {method.type === 'upi' ? 'UPI ID' : method.type === 'bank' ? 'Bank Transfer' : 'Redeem Code'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono truncate block">
                      {method.type === 'upi'
                        ? method.fields.upi_id
                        : method.type === 'bank'
                        ? `A/C: ${method.fields.account_number} (${method.fields.ifsc})`
                        : method.fields.redeem_code}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setDeleteMethodId(method.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  aria-label="Delete method"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-6 bg-slate-950/40 border border-slate-800/80 text-center">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No payment methods linked yet. Tap "+ Add Method" to add your UPI or Bank details.</p>
          </div>
        )}
      </div>

      {/* Withdrawal History Section */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold font-heading text-slate-100">
          Payout History
        </h3>

        {withdrawals.length > 0 ? (
          <div className="space-y-3">
            {withdrawals.map(w => (
              <div
                key={w.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    w.status === 'paid' || w.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : w.status === 'rejected'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {w.status === 'paid' || w.status === 'approved' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : w.status === 'rejected' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-100 block font-heading">
                      Withdrawal ₹{w.amount}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(w.created_at).toLocaleDateString()} at {new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    w.status === 'paid'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : w.status === 'approved'
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                      : w.status === 'rejected'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-6 bg-slate-950/40 border border-slate-800/80 text-center">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No withdrawal requests yet.</p>
          </div>
        )}
      </div>

      {/* In-App Notifications */}
      {notifications.length > 0 && (
        <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold font-heading text-slate-100">
              System Notifications
            </h3>
          </div>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="font-bold text-slate-200 block mb-0.5">{n.title}</span>
                <span className="text-slate-400">{n.body}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={showAddMethodModal}
        onClose={() => setShowAddMethodModal(false)}
        title="Add Payment Method"
      >
        <form onSubmit={handleSavePaymentMethod} className="space-y-4">
          {/* Method Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {(['upi', 'bank', 'redeem'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  sound.playPop()
                  setMethodType(type)
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                  methodType === type
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {type === 'upi' ? 'UPI' : type === 'bank' ? 'Bank' : 'Redeem'}
              </button>
            ))}
          </div>

          {methodType === 'upi' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="yourname@okhdfcbank"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          )}

          {methodType === 'bank' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={e => setAccountHolder(e.target.value)}
                  placeholder="As per bank passbook"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="Account Number"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">IFSC Code (11 digits)</label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={e => setIfsc(e.target.value)}
                  placeholder="SBIN0001234"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm uppercase focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {methodType === 'redeem' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Delivery Email / Phone</label>
              <input
                type="text"
                value={redeemCodeInput}
                onChange={e => setRedeemCodeInput(e.target.value)}
                placeholder="Where should code be delivered"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          )}

          {methodError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              {methodError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowAddMethodModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Save Method
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Withdrawal Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Request Withdrawal"
      >
        <form onSubmit={handleRequestWithdrawal} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">Amount (₹)</label>
              <span className="text-[11px] text-slate-400">
                Min: ₹{minWithdraw} | Max: ₹{maxWithdraw}
              </span>
            </div>
            <input
              type="number"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder={`Enter amount between ${minWithdraw} and ${maxWithdraw}`}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Payout Destination</label>
            {paymentMethods.length > 0 ? (
              <select
                value={selectedMethodId}
                onChange={e => setSelectedMethodId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {paymentMethods.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.type.toUpperCase()}: {m.type === 'upi' ? m.fields.upi_id : m.fields.account_number}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                No payment method linked. Please add UPI or Bank first.
              </div>
            )}
          </div>

          {withdrawError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              {withdrawError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowWithdrawModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingWithdraw || paymentMethods.length === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs"
            >
              {isSubmittingWithdraw ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Method Confirmation */}
      <ConfirmModal
        isOpen={!!deleteMethodId}
        title="Delete Payment Method"
        message="Are you sure you want to remove this payment method? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDeletePaymentMethod}
        onCancel={() => setDeleteMethodId(null)}
      />
    </div>
  )
}
