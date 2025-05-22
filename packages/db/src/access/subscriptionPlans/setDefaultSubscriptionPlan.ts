import { SubscriptionPlanTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const setDefaultSubscriptionPlan = (
  db: DBClient,
  subscriptionPlanId: UUID,
) =>
  db
    .update(SubscriptionPlanTable)
    .set({ isDefault: true })
    .where(eq(SubscriptionPlanTable.id, subscriptionPlanId))
    .returning()
