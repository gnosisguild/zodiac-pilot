/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test-utils/setupTests.ts', './mockDbClient.ts'],
    include: ['./src/**/*.{spec,test}.{ts,tsx}'],
    mockReset: true,
    clearMocks: true,

    retry: process.env.CI ? 3 : undefined,
  },
})
