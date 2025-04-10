import { faker } from '@faker-js/faker'
import {
  TenantTable,
  type Tenant,
  type TenantCreateInput,
} from '@zodiac/db/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const tenantFactory = createFactory<TenantCreateInput, Tenant>({
  build(tenant) {
    return {
      name: faker.company.name(),
      ...tenant,
    }
  },
  async create(db, data) {
    const [tenant] = await db.insert(TenantTable).values(data).returning()

    return tenant
  },
  createWithoutDb(data) {
    return Object.assign(
      {
        createdAt: new Date(),
        id: randomUUID(),
      },
      data,
    )
  },
})
