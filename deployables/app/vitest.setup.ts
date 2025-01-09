import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { sleepTillIdle } from '@zodiac/test-utils'
import { afterEach } from 'vitest'

afterEach(async () => {
  await sleepTillIdle()

  cleanup()
})
