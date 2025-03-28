import type { DBClient } from '../dbClient'
import { UserTable, type Tenant } from '../schema'

export const createUser = async (db: DBClient, tenant: Tenant) => {
  const [user] = await db
    .insert(UserTable)
    .values({ tenantId: tenant.id })
    .returning()

  return user
}
