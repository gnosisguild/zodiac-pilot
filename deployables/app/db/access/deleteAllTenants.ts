import { invariant } from '@epic-web/invariant'
import type { DBClient } from '../dbClient'
import { TenantTable } from '../schema'

export const deleteAllTenants = (db: DBClient) => {
  invariant(
    process.env.NODE_ENV === 'test',
    'This method must not be used outside of tests',
  )

  return db.delete(TenantTable)
}
