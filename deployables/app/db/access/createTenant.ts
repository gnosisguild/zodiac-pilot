import type { DBClient } from '../dbClient'
import { Tenant } from '../schema'

type CreateTenantOptions = {
  name: string
}

export const createTenant = (db: DBClient, { name }: CreateTenantOptions) =>
  db.insert(Tenant).values({ name })
