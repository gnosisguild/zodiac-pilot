import zodiacEslintConfig from '@zodiac/eslint-config'
import globals from 'globals'

export default [
  ...zodiacEslintConfig,
  {
    files: ['server.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]
