import { FeatureTable } from '@zodiac/db/schema'
import type { DBClient } from '../dbClient'

export const createFeature = async (db: DBClient, name: string) => {
  const [feature] = await db.insert(FeatureTable).values({ name }).returning()

  return feature
}
