import { FeatureTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const deleteFeature = (db: DBClient, featureId: UUID) =>
  db.delete(FeatureTable).where(eq(FeatureTable.id, featureId))
