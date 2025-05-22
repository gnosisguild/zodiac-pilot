import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getSubscriptionPlansForTenant = (db: DBClient, tenantId: UUID) =>
  db.query.activeSubscriptionPlans.findMany({
    where(fields, { eq }) {
      return eq(fields.tenantId, tenantId)
    },
    with: {
      subscriptionPlan: true,
    },
  })
