import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project site (https://okmorz.github.io/work1/) is served from a subpath.
  base: '/work1/',
  plugins: [react(), tailwindcss()],
})
