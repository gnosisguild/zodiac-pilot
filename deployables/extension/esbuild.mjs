import sentryEsbuildPlugin from '@sentry/esbuild-plugin'
import tailwindcss from '@tailwindcss/postcss'
import esbuild from 'esbuild'
import postCssPlugin from 'esbuild-style-plugin'
import stdLibBrowser from 'node-stdlib-browser'
import plugin from 'node-stdlib-browser/helpers/esbuild/plugin'
import replace from 'postcss-replace'
import { fileURLToPath } from 'url'

const SERVE_PORT = 3999

esbuild
  .context({
    entryPoints: [
      './src/background/index.ts',

      // INJECT EIP-1193 PROVIDER TO DAPPS TO RECORD TRANSACTIONS
      './src/inject/contentScript/main.ts',
      './src/inject/injectedScript/main.ts',

      // MONITOR TAB CONNECTION STATUS AND SHOW RELOAD NOTIFICATION
      './src/monitor/contentScript/main.ts',
      './src/monitor/injectedScript/main.ts',

      // COMPANION APP TO EDIT ROUTES
      './src/companion/contentScripts/main.ts',
      './src/companion/contentScripts/fork-support.ts',
      './src/companion/injectedScripts/main.ts',

      // SIDEPANEL APP
      './src/panel/app.tsx',
    ],
    bundle: true,
    /** IMPORTANT: For scripts that are injected into other apps, it's crucial we build to IIFE format to avoid global scope clashes. */
    format: 'iife',
    treeShaking: true,
    minify: process.env.NODE_ENV !== 'development',
    sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : true,
    loader: {
      '.svg': 'file',
      '.woff': 'file',
      '.woff2': 'file',
      '.png': 'file',
      '.html': 'text',
    },

    target: ['chrome96'],
    outdir: './public/build',
    publicPath: '/build',
    inject: [
      fileURLToPath(
        import.meta.resolve('node-stdlib-browser/helpers/esbuild/shim'),
      ),
    ],
    define: {
      'process.env.LIVE_RELOAD':
        process.env.NODE_ENV === 'development'
          ? `"http://127.0.0.1:${SERVE_PORT}/esbuild"`
          : 'false',
      global: 'window',
      'process.env.COMPANION_APP_URL': `"${process.env.COMPANION_APP_URL}"`,
      'process.env.ROLES_APP_URL': `"${process.env.ROLES_APP_URL || 'https://roles.gnosisguild.org'}"`,
    },
    plugins: [
      plugin(stdLibBrowser),
      postCssPlugin({
        postcss: {
          plugins: [
            tailwindcss,
            replace({ pattern: /:root/, data: { replaceAll: ':root, :host' } }),
          ],
        },
      }),
      process.env.NODE_ENV === 'production' &&
        sentryEsbuildPlugin({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'gnosis-guild',
          project: 'pilot-extension',
        }),
    ].filter(Boolean),
    logLevel: 'info',
  })
  .then(async (ctx) => {
    if (process.env.NODE_ENV === 'development') {
      await ctx.serve({ port: SERVE_PORT, servedir: './public' })
      await ctx.watch()
    } else {
      await ctx.rebuild()
      console.log('Build successful.')
      ctx.dispose()
    }
  })
