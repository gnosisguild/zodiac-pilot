import { invariant } from '@epic-web/invariant'
import type { DBClient } from '../../dbClient'

export const getDefaultSubscriptionPlan = async (db: DBClient) => {
  const plan = await db.query.subscriptionPlans.findFirst({
    where(fields, { eq }) {
      return eq(fields.isDefault, true)
    },
  })

  invariant(plan != null, 'Not default subscription plan set')

  return plan
}
