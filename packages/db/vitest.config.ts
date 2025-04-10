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

export default defineConfig({
  test: {
    alias,
    environment: 'happy-dom',
    setupFiles: ['./test-utils/setupTests.ts'],
    include: ['./src/**/*.{spec,test}.{ts,tsx}'],
    mockReset: true,
    clearMocks: true,
  },
})
