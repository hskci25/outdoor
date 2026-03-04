import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// After build, copy index.html to 404.html so hosts that serve 404.html for missing paths (e.g. GitHub Pages, Cloudflare Pages) show the SPA
function copyIndexTo404() {
  return {
    name: 'copy-index-to-404',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      const index = resolve(outDir, 'index.html')
      const notFound = resolve(outDir, '404.html')
      if (existsSync(index)) {
        copyFileSync(index, notFound)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), copyIndexTo404()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
