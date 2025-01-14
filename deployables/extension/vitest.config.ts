/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'

import { fileURLToPath } from 'url'
import tsConfig from './tsconfig.json'

const alias = Object.entries(tsConfig.compilerOptions.paths).reduce(
  (result, [key, value]) => ({
    ...result,
    [key]: fileURLToPath(new URL(value[0], import.meta.url)),
  }),
  {},
)

const { CI } = process.env

export default defineConfig({
  ssr: {
    noExternal: ['@gnosis.pm/zodiac'],
  },
  test: {
    alias,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.mts', './setup-chrome-mock.ts'],
    include: ['./src/**/*.{spec,test}.{ts,tsx}'],
    mockReset: true,
    clearMocks: true,

    coverage: {
      skipFull: true,
      enabled: CI != null,
      reportOnFailure: CI != null,
      reporter: CI ? ['json', 'json-summary'] : undefined,
      include: ['**/src/**/*.{ts,tsx}'],
      exclude: ['./setup-chrome-mock.ts', '**/src/**/*.spec.{ts,tsx}'],
    },
  },
})
