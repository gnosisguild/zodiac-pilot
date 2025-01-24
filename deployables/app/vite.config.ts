import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ isSsrBuild, command }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: './server/app.ts',
        }
      : undefined,
    sourcemap: true,
  },

  define: {
    'process.env': { NODE_ENV: process.env.NODE_ENV },
  },
  ssr: {
    noExternal:
      command === 'build' ? true : ['@gnosis.pm/zodiac', 'evm-proxy-detection'],
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'gnosis-guild',
      project: 'pilot-companion-app',
    }),
  ],
}))
