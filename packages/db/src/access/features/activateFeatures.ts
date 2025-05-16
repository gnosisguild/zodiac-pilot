import { ActiveFeatureTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type ActivateFeaturesOptions = {
  tenantId: UUID
  featureIds: UUID[]
}

export const activateFeatures = (
  db: DBClient,
  { tenantId, featureIds }: ActivateFeaturesOptions,
) =>
  db
    .insert(ActiveFeatureTable)
    .values(featureIds.map((featureId) => ({ tenantId, featureId })))
