import { TenantTable } from '@zodiac/db/schema'
import type { DBClient } from '../../dbClient'

type CreateTenantOptions = {
  name: string
  externalId: string
}

export const createTenant = async (
  db: DBClient,
  { name, externalId }: CreateTenantOptions,
) => {
  const [tenant] = await db
    .insert(TenantTable)
    .values({ name, externalId })
    .returning()

  return tenant
}
