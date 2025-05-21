import { ActiveSubscriptionTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type ActivatePlanOptions = {
  tenantId: UUID
  subscriptionPlanId: UUID
  validFrom?: Date
  validThrough?: Date
}

export const activatePlan = (
  db: DBClient,
  {
    tenantId,
    subscriptionPlanId,
    validFrom,
    validThrough,
  }: ActivatePlanOptions,
) =>
  db
    .insert(ActiveSubscriptionTable)
    .values({ subscriptionPlanId, tenantId, validFrom, validThrough })
