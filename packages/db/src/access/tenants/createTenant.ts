import { TenantTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import type { DBClient } from '../../dbClient'
import { activatePlan, getDefaultSubscriptionPlan } from '../subscriptionPlans'

type CreateTenantOptions = {
  name: string
  externalId: string
  createdById: UUID
}

export const createTenant = async (
  db: DBClient,
  { name, externalId, createdById }: CreateTenantOptions,
) =>
  db.transaction(async (tx) => {
    const [tenant] = await tx
      .insert(TenantTable)
      .values({ name, externalId, createdById })
      .returning()

    const defaultSubscriptionPlan = await getDefaultSubscriptionPlan(tx)

    await activatePlan(tx, {
      tenantId: tenant.id,
      subscriptionPlanId: defaultSubscriptionPlan.id,
    })

    return tenant
  })
