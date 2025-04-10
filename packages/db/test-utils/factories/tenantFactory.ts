import { TenantTable, type Tenant, type TenantCreateInput } from '@zodiac/db'
import { createFactory } from './createFactory'

export const tenantFactory = createFactory<TenantCreateInput, Tenant>({
  build(tenant) {
    return {
      name: 'Test tenant',
      ...tenant,
    }
  },
  async create(db, data) {
    const [tenant] = await db.insert(TenantTable).values(data).returning()

    return tenant
  },
})
