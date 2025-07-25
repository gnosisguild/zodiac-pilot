import { invariant } from '@epic-web/invariant'
import { DrizzleError } from 'drizzle-orm'
import { Ref } from 'react'
import { it, vitest } from 'vitest'
import { DBClient } from '../src'

const dbClientRef: Ref<DBClient> = { current: null }

export const getMockedDb = () => {
  invariant(
    dbClientRef.current != null,
    'No DB has been mocked for this test. Make sure to use `dbIt` from `@zodiac/db/test-utils` instead of the default `it` from `vitest`.',
  )

  return dbClientRef.current
}

export const dbIt = it.extend<{ db: DBClient }>({
  db: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { dbClient } =
        await vitest.importActual<typeof import('../src')>('../src')

      try {
        await dbClient().transaction(async (tx) => {
          dbClientRef.current = tx

          await use(tx)

          tx.rollback()
        })
      } catch (error) {
        if (error instanceof DrizzleError && error.message === 'Rollback') {
          return
        }

        throw error
      }
    },
    { auto: true },
  ],
})
