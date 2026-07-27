import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project site (https://okmorz.github.io/work1/) is served from a subpath.
  base: '/work1/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-48.png'],
      manifest: {
        name: '家計簿アプリ',
        short_name: '家計簿',
        description:
          '年間の貯金目標から「今月・今日あといくら使えるか」を可視化する家計簿アプリ',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/work1/',
        scope: '/work1/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        // Supabase (*.supabase.co) is a different origin and intentionally has no
        // runtimeCaching rule here, so every API/auth request always goes to the
        // network — only same-origin static assets are precached for offline use.
      },
    }),
  ],
})
