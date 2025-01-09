import globals from 'globals'

import zodiacEslintConfig from '@zodiac/eslint-config'

export default [
  ...zodiacEslintConfig,

  {
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
  },

  {
    ignores: ['public/build', 'playwright-report'],
  },

  {
    files: ['esbuild.mjs', 'manifest-util.js'],
    languageOptions: { globals: { process: true } },
  },
]
