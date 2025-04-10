import { TenantTable } from '@zodiac/db/schema'
import type { DBClient } from '../dbClient'

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
