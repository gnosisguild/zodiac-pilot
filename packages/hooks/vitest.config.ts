/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.mts'],
    include: ['./src/**/*.{spec,test}.{ts,tsx}'],
    mockReset: true,
    clearMocks: true,
  },
})
