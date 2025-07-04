import { reactRouter } from '@react-router/dev/vite'
import { sentryReactRouter } from '@sentry/react-router'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { corsMiddleware } from './middleware'

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
    'process.env.PILOT_EXTENSION_ID': `"${process.env.PILOT_EXTENSION_ID}"`,
    'process.env': JSON.stringify({
      ...process.env,

      WORKOS_REDIRECT_URI: getWorkOSRedirectURI(),
    }),
  },

  server: {
    port: 3040,
    cors: false,
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
    // allow calling fork RPC from any app
    {
      name: 'cors-middleware',
      configureServer(server) {
        server.middlewares.use(corsMiddleware())
      },
    },
  ],

  sentryConfig,
}))

const getWorkOSRedirectURI = () => {
  switch (process.env.VERCEL_ENV) {
    case 'production':
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/callback`
    case 'preview':
      return `https://${process.env.VERCEL_BRANCH_URL}/callback`
    default:
      return process.env.WORKOS_REDIRECT_URI
  }
}
