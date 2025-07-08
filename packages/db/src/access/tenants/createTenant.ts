import {
  TenantTable,
  WorkspaceTable,
  type Tenant,
  type User,
} from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'
import { activatePlan, getDefaultSubscriptionPlan } from '../subscriptionPlans'
import { verifyTenant } from './verifyTenant'

type CreateTenantOptions = {
  name: string
  externalId: string
  createdBy: User
}

export const createTenant = async (
  db: DBClient,
  { name, externalId, createdBy }: CreateTenantOptions,
): Promise<Tenant> =>
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

    return addDefaultWorkspace(tx, tenant.id, createdBy)
  })

const addDefaultWorkspace = async (
  db: DBClient,
  tenantId: UUID,
  owner: User,
): Promise<Tenant> => {
  const [workspace] = await db
    .insert(WorkspaceTable)
    .values({
      createdById: owner.id,
      label: 'Default workspace',
      tenantId,
    })
    .returning()

  const [tenant] = await db
    .update(TenantTable)
    .set({ defaultWorkspaceId: workspace.id })
    .where(eq(TenantTable.id, tenantId))
    .returning()

  return verifyTenant(tenant)
}
