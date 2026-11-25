import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile, SiteSettings } from '../types'
import { sound } from '../lib/audio'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  siteSettings: SiteSettings | null
  signInWithGoogle: (refCode?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  deleteAccount: () => Promise<void>
  showWelcomeModal: boolean
  closeWelcomeModal: () => void
  welcomeBonusAmount: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [welcomeBonusAmount, setWelcomeBonusAmount] = useState(25)

  // Load site settings
  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'general')
        .single()
      if (data && data.value) {
        setSiteSettings(data.value as SiteSettings)
        if (data.value.welcome_bonus) {
          setWelcomeBonusAmount(data.value.welcome_bonus)
        }
      }
    } catch {
      // Use defaults
    }
  }, [])

  const loadProfile = useCallback(async (userId: string, currentUser?: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile does not exist yet -> Create new profile
        const randomCode = 'CR' + Math.random().toString(36).substring(2, 8).toUpperCase()
        const pendingRefCode = localStorage.getItem('cr_pending_ref')

        let referredById: string | null = null
        if (pendingRefCode) {
          const { data: refUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', pendingRefCode.trim().toUpperCase())
            .single()
          if (refUser && refUser.id !== userId) {
            referredById = refUser.id
          }
          localStorage.removeItem('cr_pending_ref')
        }

        const bonus = 25
        const newProfile: Partial<Profile> = {
          id: userId,
          google_id: currentUser?.id,
          display_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User',
          avatar_url: currentUser?.user_metadata?.avatar_url,
          accent_color: '#10B981',
          theme: 'dark',
          referral_code: randomCode,
          referred_by: referredById || undefined,
          total_earned: bonus,
          balance: bonus,
          blocked: false
        }

        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (!createErr && created) {
          // Record welcome transaction
          await supabase.from('transactions').insert({
            user_id: userId,
            type: 'welcome_bonus',
            amount: bonus,
            note: 'Welcome Bonus credited'
          })

          // Record referral if applicable
          if (referredById) {
            await supabase.from('referrals').insert({
              referrer_id: referredById,
              referred_id: userId,
              reward_paid: false
            })
          }

          setProfile(created as Profile)
          setShowWelcomeModal(true)
          sound.playSuccess()
        }
      } else if (data) {
        setProfile(data as Profile)
      }
    } catch (e) {
      console.error('Error loading profile:', e)
    }
  }, [])

  useEffect(() => {
    fetchSettings()

    // Listen to session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id, session.user)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id, session.user)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [fetchSettings, loadProfile])

  const signInWithGoogle = async (refCode?: string) => {
    if (refCode && refCode.trim()) {
      localStorage.setItem('cr_pending_ref', refCode.trim().toUpperCase())
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    sound.playPop()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id, user)
    }
  }

  const deleteAccount = async () => {
    if (!user) return
    // Anonymize or delete profile
    await supabase
      .from('profiles')
      .update({
        display_name: 'Deleted User',
        deleted_at: new Date().toISOString(),
        blocked: true
      })
      .eq('id', user.id)
    await signOut()
  }

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        siteSettings,
        signInWithGoogle,
        signOut,
        refreshProfile,
        deleteAccount,
        showWelcomeModal,
        closeWelcomeModal,
        welcomeBonusAmount
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
