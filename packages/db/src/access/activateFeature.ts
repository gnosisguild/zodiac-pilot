import { ActiveFeatureTable } from '@zodiac/db/schema'
import type { DBClient } from '../dbClient'

type ActivateFeatureOptions = {
  tenantId: string
  featureId: string
}

export const activateFeature = (
  db: DBClient,
  { tenantId, featureId }: ActivateFeatureOptions,
) => db.insert(ActiveFeatureTable).values({ tenantId, featureId })
