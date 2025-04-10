import type { DBClient } from '../dbClient'
import { TenantMembershipTable, type Tenant, type User } from '../schema'

export const addUserToTenant = (db: DBClient, tenant: Tenant, user: User) => {
  return db
    .insert(TenantMembershipTable)
    .values({ userId: user.id, tenantId: tenant.id })
    .onConflictDoNothing()
}
