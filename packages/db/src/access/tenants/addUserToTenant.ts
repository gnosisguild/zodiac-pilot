import {
  TenantMembershipTable,
  type Tenant,
  type User,
} from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'

export const addUserToTenant = (db: DBClient, tenant: Tenant, user: User) => {
  return db
    .insert(TenantMembershipTable)
    .values({ userId: user.id, tenantId: tenant.id })
    .onConflictDoNothing()
}
