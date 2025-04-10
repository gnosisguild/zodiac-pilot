import { invariant } from '@epic-web/invariant'
import { FeatureTable, type DBClient } from '@zodiac/db'

export const deleteAllFeatures = (db: DBClient) => {
  invariant(
    process.env.NODE_ENV === 'test',
    'This method must not be used outside of tests',
  )

  // eslint-disable-next-line drizzle/enforce-delete-with-where
  return db.delete(FeatureTable)
}
