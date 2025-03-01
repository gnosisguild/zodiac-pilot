/// <reference types="vitest" />

import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'
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
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts', '@zodiac/test-utils/setup-chrome-mock'],
    include: ['./app/**/*.{spec,test}.{ts,tsx}'],
    mockReset: true,
    clearMocks: true,

    poolOptions: {
      forks: { singleFork: true },
      threads: { singleThread: true },
      vmForks: { singleFork: true },
      vmThreads: { singleThread: true },
    },

    coverage: {
      skipFull: true,
      enabled: CI != null,
      reportOnFailure: CI != null,
      reporter: CI ? ['json', 'json-summary'] : undefined,
      include: ['**/app/**/*.{ts,tsx}'],
      exclude: ['**/src/**/*.spec.{ts,tsx}'],
    },
  },
})
