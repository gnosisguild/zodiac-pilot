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

export default defineConfig({
  test: {
    alias,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.mts', '@zodiac/test-utils/setup-chrome-mock'],
    include: ['./src/**/*.{spec,test}.{ts,tsx}'],
    mockReset: true,
    clearMocks: true,
  },
})
