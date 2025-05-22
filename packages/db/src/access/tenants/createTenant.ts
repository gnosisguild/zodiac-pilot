import { TenantTable } from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'
import { activatePlan, getDefaultSubscriptionPlan } from '../subscriptionPlans'

type CreateTenantOptions = {
  name: string
  externalId: string
}

export const createTenant = async (
  db: DBClient,
  { name, externalId }: CreateTenantOptions,
) =>
  db.transaction(async (tx) => {
    const [tenant] = await tx
      .insert(TenantTable)
      .values({ name, externalId })
      .returning()

    const defaultSubscriptionPlan = await getDefaultSubscriptionPlan(tx)

    await activatePlan(tx, {
      tenantId: tenant.id,
      subscriptionPlanId: defaultSubscriptionPlan.id,
    })

    return tenant
  })
