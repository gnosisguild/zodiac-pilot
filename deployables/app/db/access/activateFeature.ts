import type { DBClient } from '../dbClient'
import { ActiveFeatureTable } from '../schema'

type ActivateFeatureOptions = {
  tenantId: string
  featureId: string
}

export const activateFeature = (
  db: DBClient,
  { tenantId, featureId }: ActivateFeatureOptions,
) => db.insert(ActiveFeatureTable).values({ tenantId, featureId })
