import { SubscriptionPlanTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const setDefaultSubscriptionPlan = async (
  db: DBClient,
  subscriptionPlanId: UUID,
) =>
  db.transaction(async (tx) => {
    await tx
      .update(SubscriptionPlanTable)
      .set({ isDefault: false })
      .where(eq(SubscriptionPlanTable.isDefault, true))
    await tx
      .update(SubscriptionPlanTable)
      .set({ isDefault: true })
      .where(eq(SubscriptionPlanTable.id, subscriptionPlanId))
  })
