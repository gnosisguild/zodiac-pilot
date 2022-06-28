const esbuild = require('esbuild')
const cssModulesPlugin = require('esbuild-css-modules-plugin')
const plugin = require('node-stdlib-browser/helpers/esbuild/plugin')
const stdLibBrowser = require('node-stdlib-browser')

require('dotenv').config()

esbuild
  .build({
    entryPoints: [
      './src/background.ts',
      './src/contentScript.ts',
      './src/inject.ts',
      './src/ganache.ts',
      './src/app.tsx',
    ],
    bundle: true,
    minify: process.env.NODE_ENV !== 'production',
    sourcemap: process.env.NODE_ENV !== 'production' ? 'inline' : false,
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
      'process.env.ETHERSCAN_API_KEY': `"${process.env.ETHERSCAN_API_KEY}"`,
      'process.env.TENDERLY_ACCESS_KEY': `"${process.env.TENDERLY_ACCESS_KEY}"`,
      'process.env.TENDERLY_PROJECT': `"${process.env.TENDERLY_PROJECT}"`,
      'process.env.TENDERLY_USER': `"${process.env.TENDERLY_USER}"`,
      global: 'window',
      // process: 'process',
      // Buffer: 'Buffer',
    },
    plugins: [plugin(stdLibBrowser), cssModulesPlugin()],
    watch: process.env.NODE_ENV === 'development' && {
      onRebuild() {
        console.log('Rebuild successful.')
      },
    },
  })
  .then(() => console.log('Build successful.'))
  .catch(() => process.exit(1))
