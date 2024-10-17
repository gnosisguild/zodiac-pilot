import esbuild from 'esbuild'
import cssModulesPlugin from 'esbuild-css-modules-plugin'
import stdLibBrowser from 'node-stdlib-browser'
import plugin from 'node-stdlib-browser/helpers/esbuild/plugin'
import { fileURLToPath } from 'url'

import { config } from 'dotenv'

config()

const SERVE_PORT = 3999

esbuild
  .context({
    entryPoints: [
      './src/background/index.ts',

      './src/connect/contentScript.ts',
      './src/connect/contentScriptIframe.ts',
      './src/connect/injectedScript.ts',

      './src/inject/injectedScript.ts',
      './src/inject/contentScript.ts',

      './src/monitor/injectedScript.ts',
      './src/monitor/contentScript.ts',

      './src/panel/app.tsx',
    ],
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV !== 'production' ? 'inline' : 'linked',
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
        import.meta.resolve('node-stdlib-browser/helpers/esbuild/shim')
      ),
    ],
    define: {
      'process.env.LIVE_RELOAD':
        process.env.NODE_ENV === 'development'
          ? `"http://127.0.0.1:${SERVE_PORT}/esbuild"`
          : 'false',
      global: 'window',
    },
    plugins: [plugin(stdLibBrowser), cssModulesPlugin()],
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
