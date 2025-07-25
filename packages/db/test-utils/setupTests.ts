import { closeCurrentClient } from '@zodiac/db'
import { sleepTillIdle } from '@zodiac/test-utils'
import { afterAll } from 'vitest'

afterAll(async () => {
  await sleepTillIdle()

  await closeCurrentClient()
})
