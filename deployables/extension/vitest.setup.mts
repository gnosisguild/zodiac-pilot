import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { sleepTillIdle } from '@zodiac/test-utils'
import { config } from 'dotenv'
import { configMocks, mockAnimationsApi } from 'jsdom-testing-mocks'
import { afterAll, afterEach, vi } from 'vitest'

vi.mock('@zodiac/env', async (importOriginal) => {
  const module = await importOriginal<typeof import('@zodiac/env')>()

  return {
    ...module,

    getCompanionAppUrl: vi.fn(),
  }
})

config()

configMocks({ afterEach, afterAll })

mockAnimationsApi()

window.document.body.innerHTML = '<div id="root"></div>'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

afterEach(async () => {
  await sleepTillIdle()

  cleanup()
})
