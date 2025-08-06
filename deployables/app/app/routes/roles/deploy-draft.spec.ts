import { dbIt } from '@zodiac/db/test-utils'
import { describe } from 'vitest'

describe('Deploy Role', () => {
  describe('Member Safes', () => {
    dbIt.todo('creates a Safe for each member')
    dbIt.todo('creates a Safe for each member on each chain')
    dbIt.todo('re-uses Safes when they already exist')
  })
})
