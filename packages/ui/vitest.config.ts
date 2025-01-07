/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'

const { CI } = process.env

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.mts'],
    include: ['./src/**/*.{spec,test}.{ts,tsx}'],
    mockReset: true,
    clearMocks: true,

    coverage: {
      skipFull: true,
      enabled: CI != null,
      reportOnFailure: CI != null,
      reporter: CI ? ['json', 'json-summary'] : undefined,
      include: ['**/src/**/*.{ts,tsx}'],
      exclude: ['**/src/**/*.spec.{ts,tsx}'],
    },
  },
})
