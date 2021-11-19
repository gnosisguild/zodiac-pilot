const esbuild = require('esbuild')

esbuild
  .build({
    entryPoints: ['./src/background.ts', './src/app.tsx'],
    bundle: true,
    minify: process.env.NODE_ENV !== 'production',
    sourcemap: process.env.NODE_ENV !== 'production',
    target: ['chrome96'],
    outdir: './public/build',
    define: {
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
    watch: process.env.NODE_ENV === 'development' && {
      onRebuild() {
        console.log('Rebuild successful.')
      },
    },
  })
  .then(() => console.log('Build successful.'))
  .catch(() => process.exit(1))
