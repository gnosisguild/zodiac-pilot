import autoprefixer from 'autoprefixer'
import { config } from 'dotenv'
import esbuild from 'esbuild'
import postCssPlugin from 'esbuild-style-plugin'
import stdLibBrowser from 'node-stdlib-browser'
import plugin from 'node-stdlib-browser/helpers/esbuild/plugin'
import tailwindcss from 'tailwindcss'
import { fileURLToPath } from 'url'

config()

const SERVE_PORT = 3999

esbuild
  .context({
    entryPoints: [
      './src/background/index.ts',

      // ALLOW PILOT TO CONNECT TO USER'S BROWSER WALLET
      './src/connect/contentScripts/dApp.ts',
      './src/connect/contentScripts/connectIframe.ts',
      './src/connect/injectedScript/main.ts',

      // INJECT EIP-1193 PROVIDER TO DAPPS TO RECORD TRANSACTIONS
      './src/inject/contentScript/main.ts',
      './src/inject/injectedScript/main.ts',

      // MONITOR TAB CONNECTION STATUS AND SHOW RELOAD NOTIFICATION
      './src/monitor/contentScript/main.ts',
      './src/monitor/injectedScript/main.ts',

      // SIDEPANEL APP
      './src/panel/app.tsx',
    ],
    bundle: true,
    /** IMPORTANT: For scripts that are injected into other apps, it's crucial we build to IIFE format to avoid global scope clashes. */
    format: 'iife',
    treeShaking: true,
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
        import.meta.resolve('node-stdlib-browser/helpers/esbuild/shim'),
      ),
    ],
    define: {
      'process.env.LIVE_RELOAD':
        process.env.NODE_ENV === 'development'
          ? `"http://127.0.0.1:${SERVE_PORT}/esbuild"`
          : 'false',
      global: 'window',
    },
    plugins: [
      plugin(stdLibBrowser),
      postCssPlugin({
        postcss: { plugins: [tailwindcss, autoprefixer] },
      }),
    ],
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
