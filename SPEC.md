# SPEC.md: Cash Reward (User Panel)

## 1. Product Summary
**Cash Reward** is a high-polish, production-grade earning web platform built with **React 18 + Vite + TypeScript, Tailwind CSS, Framer Motion, and Supabase**. It features PWA capabilities (offline support, service worker, install prompt, manifest), Google OAuth authentication, real-time balance tracking, task offers with 5-step verification, proof uploading to Supabase Storage, payment method management (UPI, Bank, Play Store Redeem Code), withdrawal requests, referral system, animated leaderboards, and comprehensive history tracking.

## 2. User Roles & Capabilities
- **End User:**
  - Authenticates solely through Google OAuth.
  - Receives welcome bonus on onboarding and can submit an optional referral code.
  - Browses active, published tasks and banners configured by admin.
  - Follows step-by-step app install workflows, uploads gallery screenshots for proof (up to 5MB each, validated), and submits.
  - Tracks status in History across Pending, Complete, and Rejected tabs with 7-day auto-expiry rules.
  - Adds/edits/deletes personal withdrawal methods (UPI, Bank Transfer, Redeem Code).
  - Requests withdrawals with minimum and maximum limit validations.
  - Participates in Refer & Earn with referral code, share link (Web Share API).
  - Competes on Leaderboard (Top 3 animated podium + top 50 ranking).
  - Personalizes Profile: theme toggle (dark/light, default dark), accent color picker, avatar upload, account deletion.
- **Admin Managed (Read-only for this User Panel):**
  - Site settings (site name, maintenance mode, welcome bonus, referral reward, withdraw limits, contact channels).
  - Tasks, Task Steps, Task Terms, Banners, Info Pages (About, Terms, Privacy).

## 3. Data Model (PostgreSQL on Supabase)
- `profiles`: id, google_id, display_name, avatar_url, accent_color, theme, referral_code, referred_by, total_earned, balance, blocked, created_at, deleted_at
- `site_settings`: key, value (JSONB)
- `banners`: id, image_url, title, subtitle, link, sort_order, active
- `tasks`: id, name, title, logo_url, banner_url, banner_ratio, play_store_url, prize_inr, demo_proof_url, proof_max_images, badge_hot, badge_exclusive, badge_new, badge_limited, featured, category, published, created_at
- `task_steps`: id, task_id, step_order, title, body, image_url
- `task_terms`: id, task_id, term_order, title, body
- `submissions`: id, user_id, task_id, status (pending|approved|rejected), reject_reason, created_at, decided_at [UNIQUE(user_id, task_id)]
- `submission_images`: id, submission_id, image_url, created_at
- `payment_methods`: id, user_id, type (upi|bank|redeem), fields (JSONB), created_at
- `redeem_codes`: id, code, assigned_to, amount, status, created_at
- `withdrawals`: id, user_id, amount, method_id, status (pending|approved|paid|rejected), created_at, updated_at
- `transactions`: id, user_id, type, amount, note, created_at
- `referrals`: id, referrer_id, referred_id, reward_paid, created_at
- `notifications`: id, user_id, title, body, read, created_at
- `pages`: slug, title, body
- `contact_messages`: id, user_id, name, email, message, created_at

Storage Buckets:
- `task_logos`, `banners`, `proof_images`, `avatars`

## 4. Screens & Navigation
- **Navigation:** Bottom Navigation bar on mobile (<768px), Left Sidebar on desktop (>=768px).
- **Routes:**
  - `/` : Home (Slider banners, Quick stats, Featured tasks, Total tasks count)
  - `/offers` : Offers list (Search, Badges/Category filters, Sorting by prize & date)
  - `/offers/:id` : Task Details (Banner 16:9, Demo proof, 5 step cards with toggle states, Terms cards, Play Store button, Proof submission with multi-image gallery picker and progress bar)
  - `/wallet` : Wallet (Animated balance, Payment methods CRUD, Withdrawal modal, Status history, In-app notifications)
  - `/history` : History (Pending, Complete, Rejected tabs with 7-day rule, resubmit button, Transaction history with date filter & summary)
  - `/leaderboard` : Leaderboard (Ranked by total earned, Top 3 podium animations, Top 50 list)
  - `/refer` : Refer & Earn (Referral code, link, copy, Web Share API, greeting, referral status list)
  - `/profile` : Profile (Display name edit, Avatar upload, Accent color picker, Theme toggle, Info pages links, Contact Us modal, Delete account modal, Logout)
  - `/p/:slug` : Dynamic Info Pages (About, Terms, Privacy)
  - `*` : 404 Not Found screen

## 5. UI/UX & Non-Negotiables
- English only.
- Default Dark theme with instant Light theme toggle.
- Typography: Plus Jakarta Sans for headings, Inter for body.
- Lucide React SVG icons only. No emojis as icons.
- Sound & Vibration (synthesized audio chime on rewards, navigator.vibrate).
- Confetti on rewards (canvas-confetti).
- All states handled: Loading (shimmer skeletons), Empty, Error (with retry), Offline (network listener banner), Success.
- PWA manifest, service worker, offline fallback.
