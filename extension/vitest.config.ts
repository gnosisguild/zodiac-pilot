/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.mts'],
    include: ['./src/**/*.{spec,test}.ts'],
    globals: true,
  },
})
