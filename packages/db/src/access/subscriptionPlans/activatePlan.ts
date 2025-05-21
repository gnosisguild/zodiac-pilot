import { ActiveSubscriptionTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

type ActivatePlanOptions = {
  tenantId: UUID
  subscriptionPlanId: UUID
}

export const activatePlan = (
  db: DBClient,
  { tenantId, subscriptionPlanId }: ActivatePlanOptions,
) => db.insert(ActiveSubscriptionTable).values({ subscriptionPlanId, tenantId })
