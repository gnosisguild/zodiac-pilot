import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import openGraph from 'vite-plugin-open-graph'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    openGraph({
      basic: {
        type: 'website',
        title: 'Gnosis Guild',
        description: 'Zodiac Pilot — Batch and simulate transactions',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Gnosis Guild',
        description: 'Zodiac Pilot — Batch and simulate transactions',
      },
    }),
  ],
  server: {
    port: 3050,
  },
  build: {
    manifest: true,
  },
  define: {
    'process.env': {},
  },
})
