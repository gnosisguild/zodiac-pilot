import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getActivePlan = async (db: DBClient, tenantId: UUID) => {
  const activePlan = await db.query.activeSubscriptionPlans.findFirst({
    where(fields, { eq }) {
      return eq(fields.tenantId, tenantId)
    },
    with: {
      subscriptionPlan: true,
    },
  })

  invariant(
    activePlan != null,
    `Tenant with id "${tenantId}" has no active plan`,
  )

  return activePlan.subscriptionPlan
}
