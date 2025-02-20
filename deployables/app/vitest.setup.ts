import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { sleepTillIdle } from '@zodiac/test-utils'
import { afterEach, vi } from 'vitest'

Element.prototype.scrollIntoView = vi.fn()

afterEach(async () => {
  await sleepTillIdle()

  cleanup()
})
