import { ActiveFeatureTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type ActivateFeatureOptions = {
  tenantId: UUID
  featureId: UUID
}

export const activateFeature = (
  db: DBClient,
  { tenantId, featureId }: ActivateFeatureOptions,
) => db.insert(ActiveFeatureTable).values({ tenantId, featureId })
