import { reactRouter } from '@react-router/dev/vite'
import { sentryReactRouter } from '@sentry/react-router'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const sentryConfig = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: 'gnosis-guild',
  project: 'pilot-companion-app',
}

export default defineConfig((config) => ({
  build: {
    sourcemap: true,
  },

  define: {
    'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
  },

  server: {
    port: 3040,
  },

  ssr: {
    noExternal:
      config.command === 'build'
        ? true
        : ['@gnosis.pm/zodiac', 'evm-proxy-detection', '@workos-inc/widgets'],
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    sentryReactRouter(sentryConfig, config),
  ],

  sentryConfig,
}))
