import { TenantTable, type User } from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'
import { activatePlan, getDefaultSubscriptionPlan } from '../subscriptionPlans'
import { createWorkspace } from '../workspaces'

type CreateTenantOptions = {
  name: string
  externalId: string
  createdBy: User
}

export const createTenant = async (
  db: DBClient,
  { name, externalId, createdBy }: CreateTenantOptions,
) =>
  db.transaction(async (tx) => {
    const [tenant] = await tx
      .insert(TenantTable)
      .values({ name, externalId, createdById: createdBy.id })
      .returning()

    const defaultSubscriptionPlan = await getDefaultSubscriptionPlan(tx)

    await activatePlan(tx, {
      tenantId: tenant.id,
      subscriptionPlanId: defaultSubscriptionPlan.id,
    })

    await createWorkspace(tx, { tenant, createdBy, label: 'Default workspace' })

    return tenant
  })
