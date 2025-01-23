import zodiacEslintConfig from '@zodiac/eslint-config'
import globals from 'globals'

const { node } = globals

export default [
  ...zodiacEslintConfig,
  { ignores: ['build/**/*', '.react-router/**/*', '.vercel/**/*'] },
  {
    files: ['dev-server.js'],
    languageOptions: {
      globals: { process: node.process, console: node.console },
    },
  },
]
