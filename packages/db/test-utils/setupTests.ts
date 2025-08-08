import { sleepTillIdle } from '@zodiac/test-utils'
import { afterAll } from 'vitest'
import { closeCurrentClient } from '../src/dbClient'

afterAll(async () => {
  await sleepTillIdle()

  await closeCurrentClient()
})
