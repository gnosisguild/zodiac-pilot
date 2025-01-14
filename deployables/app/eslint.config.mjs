import zodiacEslintConfig from '@zodiac/eslint-config'

export default [
  ...zodiacEslintConfig,
  { ignores: ['build/**/*', '.react-router/**/*'] },
]
