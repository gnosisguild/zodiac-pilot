import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'

export const getSubscriptionPlan = async (
  db: DBClient,
  subscriptionPlanId: UUID,
) => {
  const plan = await db.query.subscriptionPlans.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, subscriptionPlanId)
    },
  })

  invariant(
    plan != null,
    `Could not find subscription plan with id "${subscriptionPlanId}"`,
  )

  return plan
}
