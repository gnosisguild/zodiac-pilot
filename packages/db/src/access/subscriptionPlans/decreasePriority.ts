import { SubscriptionPlanTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'
import { getSubscriptionPlan } from './getSubscriptionPlan'

export const decreasePriority = async (
  db: DBClient,
  subscriptionPlanId: UUID,
) => {
  const plan = await getSubscriptionPlan(db, subscriptionPlanId)

  return db
    .update(SubscriptionPlanTable)
    .set({ priority: plan.priority - 1 })
    .where(eq(SubscriptionPlanTable.id, subscriptionPlanId))
}
