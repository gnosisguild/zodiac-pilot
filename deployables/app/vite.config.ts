import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
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
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  define: {
    'process.env': {},
  },
  ssr: {
    noExternal:
      command === 'build' ? true : ['@gnosis.pm/zodiac', 'evm-proxy-detection'],
  },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'gnosis-guild',
      project: 'pilot-companion-app',
    }),
  ],
}))
