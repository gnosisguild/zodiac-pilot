import { invariant } from '@epic-web/invariant'
import type { DBClient } from '../dbClient'
import { FeatureTable } from '../schema'

export const deleteAllFeatures = (db: DBClient) => {
  invariant(
    process.env.NODE_ENV === 'test',
    'This method must not be used outside of tests',
  )

  return db.delete(FeatureTable)
}
