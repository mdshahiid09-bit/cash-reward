# Cash Reward - User Panel (PWA)

A production-ready micro-earning platform built with **React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, and Supabase**.

---

## 🌟 Key Features

1. **Authentication:**
   - Google Sign-In only (Google OAuth via Supabase Auth).
   - Welcome Bonus animation & audio fanfare on first login.
   - Referral system with unique referral codes, share link (Web Share API), and bonus crediting.
   - Account deletion option with permanent profile anonymization.

2. **Offers & Task Verification:**
   - Admin-managed active & published tasks with search, category filters, badge filters (Hot, Exclusive, New, Limited), and sort options.
   - Step-by-step task completion guide (16:9 banner, Play Store redirect, demo screenshots).
   - Proof submission with multi-image gallery uploader, 5 MB file size validation, upload progress, and storage in Supabase `proof_images` bucket.
   - Database constraint: 1 submission per user per task.

3. **Wallet & Payouts:**
   - Real-time animated balance counter.
   - Multi-method support: UPI, Bank Transfer (IMPS/NEFT), Google Play Redeem codes.
   - Withdrawal request flow with min/max limit validation (from site settings) and balance check.
   - Withdrawal history tracking with status badges (Pending, Approved, Paid, Rejected).
   - In-app system notifications.

4. **Task History:**
   - Tabs: Pending, Complete, Rejected.
   - 7-day auto-expiry rule (removes expired pending/rejected tasks).
   - Resubmit option for rejected tasks.
   - Detailed ledger transactions history with financial totals (Total Earned, Total Withdrawn).

5. **Leaderboard:**
   - Ranked by lifetime task earnings.
   - Animated Top 3 Podium (1st Gold, 2nd Silver, 3rd Bronze).
   - Full top 50 rankings with tie-breaker logic.

6. **PWA & Offline Support:**
   - Web App Manifest (`manifest.webmanifest`), service worker (`registerSW.js`).
   - Offline detection banner with live network status listener.

7. **Theming & Personalization:**
   - Dark theme (default) and Light theme switcher.
   - Dynamic accent color picker with live CSS variable adaptation.
   - Avatar upload to Supabase Storage `avatars` bucket.
   - Contact modal with Email, WhatsApp, Telegram, and in-app contact form.

---

## 🚀 Running the Project Locally

```bash
# Development server
npm run dev

# Production preview
node node_modules/vite/bin/vite.js preview --host
```

---

## 🔐 Environment Variables (`.env`)

```env
VITE_SUPABASE_URL=https://hkciawrgcqpometjlncb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrY2lhd3JnY3Fwb21ldGpsbmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNTIyMjQsImV4cCI6MjExMDkyODIyNH0.Ne3q-0Z3V56cYm_L5aC4A4A7zVfnKMDhYgqlJnTJMnE
```
