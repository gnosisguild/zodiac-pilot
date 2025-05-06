/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test-utils/setupTests.ts'],
    include: ['./src/**/*.{spec,test}.{ts,tsx}'],
    mockReset: true,
    clearMocks: true,
    fileParallelism: false,
  },
})
