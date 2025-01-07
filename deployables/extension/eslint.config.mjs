import { fixupPluginRules } from '@eslint/compat'
import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  prettierConfig,
  jsxA11y.flatConfigs.recommended,
  { files: ['**/*.{ts,tsx}'] },
  {
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
  },
  {
    plugins: {
      react: eslintPluginReact,
      'react-hooks': fixupPluginRules(eslintPluginReactHooks),
    },
  },
  {
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    ignores: ['public/build', 'playwright-report'],
  },
  {
    files: ['esbuild.mjs', 'manifest-util.js'],
    languageOptions: { globals: { process: true } },
  },
)
