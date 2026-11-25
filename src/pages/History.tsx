import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Receipt,
  Layers,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Submission, Transaction, Task } from '../types'
import { useAuth } from '../context/AuthContext'
import { sound } from '../lib/audio'

export const History: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pending' | 'complete' | 'rejected' | 'transactions'>('pending')
  const [submissions, setSubmissions] = useState<(Submission & { task?: Task })[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // Totals
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalWithdrawn, setTotalWithdrawn] = useState(0)

  useEffect(() => {
    if (!user) return

    const loadHistory = async () => {
      setLoading(true)
      try {
        // 1. Fetch Submissions with Task details
        const { data: subData } = await supabase
          .from('submissions')
          .select('*, task:tasks(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setSubmissions(subData || [])

        // 2. Fetch Transactions
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        const txList = txData || []
        setTransactions(txList)

        // Calculate totals
        let earned = 0
        let withdrawn = 0
        txList.forEach(t => {
          if (t.amount > 0) earned += Number(t.amount)
          if (t.amount < 0) withdrawn += Math.abs(Number(t.amount))
        })
        setTotalEarned(earned)
        setTotalWithdrawn(withdrawn)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user])

  // Filter 7-day rule for Pending & Rejected:
  // Pending tasks older than 7 days are hidden from pending tab
  // Rejected tasks older than 7 days are removed from rejected tab
  const now = new Date().getTime()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

  const pendingList = submissions.filter(s => {
    if (s.status !== 'pending') return false
    const createdAt = new Date(s.created_at).getTime()
    return now - createdAt <= sevenDaysMs
  })

  const completeList = submissions.filter(s => s.status === 'approved')

  const rejectedList = submissions.filter(s => {
    if (s.status !== 'rejected') return false
    const decidedAt = s.decided_at ? new Date(s.decided_at).getTime() : new Date(s.created_at).getTime()
    return now - decidedAt <= sevenDaysMs
  })

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header & Financial Summary */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100 mb-1">
          Activity & History
        </h1>
        <p className="text-sm text-slate-400">
          Track verified task completions, submitted proofs, and wallet ledger entries.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Total Earned
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-heading">
            ₹{totalEarned.toFixed(0)}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Total Withdrawn
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-heading">
            ₹{totalWithdrawn.toFixed(0)}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            In Review
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
            {pendingList.length} Tasks
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <button
          onClick={() => {
            sound.playPop()
            setActiveTab('pending')
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending ({pendingList.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playPop()
            setActiveTab('complete')
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'complete'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Complete ({completeList.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playPop()
            setActiveTab('rejected')
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'rejected'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Rejected ({rejectedList.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playPop()
            setActiveTab('transactions')
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'transactions'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Transactions</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'pending' ? (
          pendingList.length > 0 ? (
            <div className="space-y-3">
              {pendingList.map(sub => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={sub.task?.logo_url || 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=160&q=80'}
                      alt={sub.task?.name || 'Task'}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 font-heading truncate">
                        {sub.task?.name || 'Task Offer'}
                      </h4>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Submitted on {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-slate-500 block">Reward</span>
                    <span className="text-base font-extrabold text-emerald-400 font-heading">
                      ₹{sub.task?.prize_inr || 0}
                    </span>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Under Review
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl p-10 bg-slate-900/60 border border-slate-800 text-center">
              <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No pending submissions awaiting review.</p>
            </div>
          )
        ) : activeTab === 'complete' ? (
          completeList.length > 0 ? (
            <div className="space-y-3">
              {completeList.map(sub => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={sub.task?.logo_url || 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=160&q=80'}
                      alt={sub.task?.name || 'Task'}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 font-heading truncate">
                        {sub.task?.name || 'Task Offer'}
                      </h4>
                      <span className="text-xs text-emerald-400 font-semibold block mt-0.5">
                        Approved ✓ Reward Credited
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-slate-500 block">Earned</span>
                    <span className="text-base font-extrabold text-emerald-400 font-heading">
                      +₹{sub.task?.prize_inr || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl p-10 bg-slate-900/60 border border-slate-800 text-center">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No completed tasks yet. Browse offers to earn!</p>
            </div>
          )
        ) : activeTab === 'rejected' ? (
          rejectedList.length > 0 ? (
            <div className="space-y-3">
              {rejectedList.map(sub => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={sub.task?.logo_url || 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=160&q=80'}
                      alt={sub.task?.name || 'Task'}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-800 flex-shrink-0 mt-0.5"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 font-heading truncate">
                        {sub.task?.name || 'Task Offer'}
                      </h4>
                      <span className="text-xs text-rose-400 block mt-0.5">
                        Reason: {sub.reject_reason || 'Screenshots could not be verified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    {sub.task_id && (
                      <Link
                        to={`/offers/${sub.task_id}`}
                        onClick={() => sound.playPop()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resubmit</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl p-10 bg-slate-900/60 border border-slate-800 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Great job! You have zero rejected tasks.</p>
            </div>
          )
        ) : (
          /* Transactions List */
          transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.amount > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block font-heading">
                        {tx.note || tx.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-heading font-extrabold text-sm">
                    <span className={tx.amount > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                      {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl p-10 bg-slate-900/60 border border-slate-800 text-center">
              <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No transactions recorded yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
