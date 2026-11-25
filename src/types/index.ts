export interface Profile {
  id: string
  google_id?: string
  display_name: string
  avatar_url?: string
  accent_color: string
  theme: 'dark' | 'light'
  referral_code: string
  referred_by?: string
  total_earned: number
  balance: number
  blocked: boolean
  created_at: string
  deleted_at?: string
}

export interface SiteSettings {
  site_name: string
  maintenance_mode: boolean
  welcome_bonus: number
  referral_reward: number
  withdraw_min: number
  withdraw_max: number
  proof_max_images: number
}

export interface ContactSettings {
  email?: string
  whatsapp?: string
  telegram?: string
  enabled_methods: string[]
}

export interface Banner {
  id: string
  image_url: string
  title: string
  subtitle?: string
  link?: string
  sort_order: number
  active: boolean
}

export interface Task {
  id: string
  name: string
  title: string
  logo_url: string
  banner_url?: string
  banner_ratio: string
  play_store_url: string
  prize_inr: number
  demo_proof_url?: string
  proof_max_images: number
  badge_hot: boolean
  badge_exclusive: boolean
  badge_new: boolean
  badge_limited: boolean
  featured: boolean
  category: string
  published: boolean
  created_at: string
}

export interface TaskStep {
  id: string
  task_id: string
  step_order: number
  title: string
  body: string
  image_url?: string
}

export interface TaskTerm {
  id: string
  task_id: string
  term_order: number
  title: string
  body: string
}

export interface Submission {
  id: string
  user_id: string
  task_id: string
  status: 'pending' | 'approved' | 'rejected'
  reject_reason?: string
  created_at: string
  decided_at?: string
  task?: Task
  images?: string[]
}

export interface PaymentMethod {
  id: string
  user_id: string
  type: 'upi' | 'bank' | 'redeem'
  fields: {
    upi_id?: string
    account_number?: string
    ifsc?: string
    account_holder?: string
    bank_name?: string
    phone?: string
    redeem_code?: string
  }
  created_at: string
}

export interface Withdrawal {
  id: string
  user_id: string
  amount: number
  method_id?: string
  method?: string
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  note?: string
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referee_id?: string
  referred_id?: string
  reward_paid: boolean
  created_at: string
  referee?: {
    display_name: string
    avatar_url?: string
    created_at: string
  }
}

export interface NotificationItem {
  id: string
  user_id: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export interface PageContent {
  slug: string
  title: string
  body: string
}
