/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'

import { fileURLToPath } from 'url'
import tsConfig from './tsconfig.json'

const alias = Object.entries(tsConfig.compilerOptions.paths).reduce(
  (result, [key, value]) => ({
    ...result,
    [key]: fileURLToPath(new URL(value[0], import.meta.url)),
  }),
  {}
)

export default defineConfig({
  test: {
    alias,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.mts'],
    include: ['./src/**/*.{spec,test}.ts'],
    globals: true,
  },
})
