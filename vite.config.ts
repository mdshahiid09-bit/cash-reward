import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        mode: 'development'
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Cash Reward - Micro Earning Platform',
        short_name: 'CashReward',
        description: 'Complete offers, refer friends, and earn real cash via UPI & Bank Transfer',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=192&q=80',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?w=512&q=80',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
