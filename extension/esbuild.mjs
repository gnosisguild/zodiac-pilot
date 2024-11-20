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

      // CONNECt DAPP
      './src/pilot-connect/contentScripts/connectPilotToDApp.ts',
      './src/pilot-connect/contentScripts/connectPilotToInjectedIFrame.ts',

      './src/pilot-connect/injectedScripts/connectOriginalWalletToPilot.ts',

      // CONNECT INJECTED WALLET
      './src/injected-wallet-connect/contentScripts/enableInjectedProviderCommunication.ts',

      './src/injected-wallet-connect/injectedScripts/enableInjectedProvider.ts',

      // MONITOR
      './src/pilot-connect-monitor/contentScripts/setupConnectionMonitoring.ts',

      './src/pilot-connect-monitor/injectedScripts/handleConnectionStatusChange.ts',

      './src/panel/app.tsx',
    ],
    bundle: true,
    format: 'esm',
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
    plugins: [
      plugin(stdLibBrowser),
      // cssModulesPlugin(),
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