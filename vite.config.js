import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mindful-exploration-production-8f55.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'https://mindful-exploration-production-8f55.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
