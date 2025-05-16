import type { UUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { ActiveFeatureTable } from '../../../schema'
import type { DBClient } from '../../dbClient'

type DeactivateFeatureOptions = {
  tenantId: UUID
  featureId: UUID
}

export const deactivateFeature = (
  db: DBClient,
  { tenantId, featureId }: DeactivateFeatureOptions,
) =>
  db
    .delete(ActiveFeatureTable)
    .where(
      and(
        eq(ActiveFeatureTable.tenantId, tenantId),
        eq(ActiveFeatureTable.featureId, featureId),
      ),
    )
