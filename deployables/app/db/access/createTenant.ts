import type { DBClient } from '../dbClient'
import { Tenant } from '../schema'

type CreateTenantOptions = {
  name: string
}

export const createTenant = async (
  db: DBClient,
  { name }: CreateTenantOptions,
) => {
  const [tenant] = await db.insert(Tenant).values({ name }).returning()

  return tenant
}
