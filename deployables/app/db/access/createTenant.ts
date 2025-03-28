import type { DBClient } from '../dbClient'
import { TenantTable } from '../schema'

type CreateTenantOptions = {
  name: string
}

export const createTenant = async (
  db: DBClient,
  { name }: CreateTenantOptions,
) => {
  const [tenant] = await db.insert(TenantTable).values({ name }).returning()

  return tenant
}
