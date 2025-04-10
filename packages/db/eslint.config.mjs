import zodiacEslintConfig from '@zodiac/eslint-config'
import drizzleEslintPlugin from 'eslint-plugin-drizzle'

export default [
  ...zodiacEslintConfig,
  {
    plugins: {
      drizzle: drizzleEslintPlugin,
    },
    rules: {
      ...drizzleEslintPlugin.configs.recommended.rules,
    },
  },
]
