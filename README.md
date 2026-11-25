# Cash Reward - User Panel (PWA)

A production-ready micro-earning platform built with **React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, and Supabase**.

---

## 🌟 Key Features

1. **Authentication:**
   - Google Sign-In only (Google OAuth via Supabase Auth).
   - Dedicated Auth Landing Page with instant ₹25 Welcome Bonus badge.
   - Protected Routes: unauthenticated users are redirected to `/login`.
   - Diagnostics error banner with exact URL error parameter inspection, Retry button, and Google Sign-in Help link.
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
   - Web App Manifest (`manifest.webmanifest`), service worker (`dist/sw.js`).
   - Offline detection banner with live network status listener.

7. **Theming & Personalization:**
   - Dark theme (default) and Light theme switcher.
   - Dynamic accent color picker with live CSS variable adaptation.
   - Avatar upload to Supabase Storage `avatars` bucket.
   - Contact modal with Email, WhatsApp, Telegram, and in-app contact form.

---

## 🔧 Google Cloud Console OAuth Configuration

Ensure the following configuration is applied in your Google Cloud Console for the OAuth 2.0 Client:

1. **OAuth Consent Screen:**
   - **User Type**: Set to **External**.
   - **Test users**: While in testing status, add your Google account email addresses under the "Test users" tab to allow them to sign in.

2. **Authorized JavaScript origins:**
   - Development: `http://localhost:5173`
   - Production domain placeholder:
     <!-- Production domain placeholder: Add https://your-production-domain.com here once deployed -->

3. **Authorized redirect URIs:**
   - Supabase Callback URL: `https://hkciawrgcqpometjlncb.supabase.co/auth/v1/callback`

---

## 🚀 Running the Project Locally

```bash
# Start development server on port 5173
cd ~/cash-reward && node node_modules/vite/bin/vite.js --host

# Or run production preview
cd ~/cash-reward && node node_modules/vite/bin/vite.js preview --host --port 5173
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Environment Variables (`.env`)

```env
VITE_SUPABASE_URL=https://hkciawrgcqpometjlncb.supabase.co
VITE_SUPABASE_ANON_KEY=<ANON_KEY_FROM_SUPABASE_PROJECT>
```
