import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api requests to the Express server, so the browser only ever
    // talks to one origin and no CORS setup is needed.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
