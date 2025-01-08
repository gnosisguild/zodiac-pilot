/// <reference types="vitest" />

import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'
import tsConfig from './tsconfig.node.json'

const alias = Object.entries(tsConfig.compilerOptions.paths).reduce(
  (result, [key, value]) => ({
    ...result,
    [key]: fileURLToPath(new URL(value[0], import.meta.url)),
  }),
  {},
)

const { CI } = process.env

export default defineConfig({
  test: {
    alias,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['./app/**/*.{spec,test}.{ts,tsx}'],
    mockReset: true,
    clearMocks: true,

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
