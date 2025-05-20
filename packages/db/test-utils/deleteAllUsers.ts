import { invariant } from '@epic-web/invariant'
import type { DBClient } from '@zodiac/db'
import { UserTable } from '@zodiac/db/schema'

export const deleteAllUsers = (db: DBClient) => {
  invariant(
    process.env.NODE_ENV === 'test',
    'This method must not be used outside of tests',
  )

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  return db.delete(UserTable)
}
