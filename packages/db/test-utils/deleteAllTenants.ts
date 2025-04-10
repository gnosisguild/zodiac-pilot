import { invariant } from '@epic-web/invariant'
import { TenantTable, type DBClient } from '@zodiac/db'

export const deleteAllTenants = (db: DBClient) => {
  invariant(
    process.env.NODE_ENV === 'test',
    'This method must not be used outside of tests',
  )

  return db.delete(TenantTable)
}
