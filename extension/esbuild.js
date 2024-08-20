// @ts-check
const esbuild = require('esbuild')
const cssModulesPlugin = require('esbuild-css-modules-plugin')
const plugin = require('node-stdlib-browser/helpers/esbuild/plugin')
const stdLibBrowser = require('node-stdlib-browser')

require('dotenv').config()

esbuild
  .context({
    entryPoints: [
      './src/background/index.ts',
      './src/contentScript.ts',
      './src/injection.ts',
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
    },
    target: ['chrome96'],
    outdir: './public/build',
    publicPath: '/build',
    inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      global: 'window',
    },
    plugins: [plugin(stdLibBrowser), cssModulesPlugin()],
    logLevel: 'info',
  })
  .then(async (ctx) => {
    if (process.env.NODE_ENV === 'development') {
      await ctx.watch()
    } else {
      await ctx.rebuild()
      console.log('Build successful.')
      ctx.dispose()
    }
  })
