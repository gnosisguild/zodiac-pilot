import type { DBClient } from '../dbClient'
import { FeatureTable } from '../schema'

export const createFeature = async (db: DBClient, name: string) => {
  const [feature] = await db.insert(FeatureTable).values({ name }).returning()

  return feature
}
