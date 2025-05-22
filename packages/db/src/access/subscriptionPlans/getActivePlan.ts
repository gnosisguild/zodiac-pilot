import { invariant } from '@epic-web/invariant'
import {
  ActiveSubscriptionTable,
  SubscriptionPlanTable,
} from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { and, desc, eq, gte, isNull, lte, or } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const getActivePlan = async (db: DBClient, tenantId: UUID) => {
  const [activePlan] = await db
    .select()
    .from(ActiveSubscriptionTable)
    .where(
      and(
        eq(ActiveSubscriptionTable.tenantId, tenantId),
        lte(ActiveSubscriptionTable.validFrom, new Date()),
        or(
          isNull(ActiveSubscriptionTable.validThrough),
          gte(ActiveSubscriptionTable.validThrough, new Date()),
        ),
      ),
    )
    .leftJoin(
      SubscriptionPlanTable,
      eq(ActiveSubscriptionTable.subscriptionPlanId, SubscriptionPlanTable.id),
    )
    .orderBy(desc(SubscriptionPlanTable.priority))
    .limit(1)

  invariant(
    activePlan != null,
    `Tenant with id "${tenantId}" has no active plan`,
  )

  return activePlan.SubscriptionPlan
}
