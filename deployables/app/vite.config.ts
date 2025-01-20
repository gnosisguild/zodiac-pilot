import { reactRouter } from '@react-router/dev/vite'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: './workers/app.ts',
        }
      : undefined,
  },
  server: {
    port: 3040,
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
    noExternal: ['@gnosis.pm/zodiac', 'evm-proxy-detection'],
  },
  plugins: [reactRouter(), tsconfigPaths()],
}))
