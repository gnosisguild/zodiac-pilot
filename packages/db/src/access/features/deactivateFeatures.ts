import type { UUID } from 'crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { ActiveFeatureTable } from '../../../schema'
import type { DBClient } from '../../dbClient'

type DeactivateFeaturesOptions = {
  tenantId: UUID
  featureIds: UUID[]
}

export const deactivateFeatures = (
  db: DBClient,
  { tenantId, featureIds }: DeactivateFeaturesOptions,
) =>
  db
    .delete(ActiveFeatureTable)
    .where(
      and(
        eq(ActiveFeatureTable.tenantId, tenantId),
        inArray(ActiveFeatureTable.featureId, featureIds),
      ),
    )
