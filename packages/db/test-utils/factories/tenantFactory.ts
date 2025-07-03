import { faker } from '@faker-js/faker'
import {
  TenantMembershipTable,
  TenantTable,
  type Tenant,
  type TenantCreateInput,
  type User,
} from '@zodiac/db/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const tenantFactory = createFactory<
  TenantCreateInput,
  Tenant,
  [members: User | [User, ...User[]]]
>({
  build(members, tenant) {
    if (Array.isArray(members)) {
      const [creator] = members

      return {
        name: faker.company.name(),
        externalId: randomUUID(),
        createdById: creator.id,

        ...tenant,
      }
    }

    return {
      name: faker.company.name(),
      externalId: randomUUID(),
      createdById: members.id,

      ...tenant,
    }
  },
  async create(db, data, members) {
    const [tenant] = await db.insert(TenantTable).values(data).returning()

    if (Array.isArray(members)) {
      await Promise.all(
        members.map((user) =>
          db
            .insert(TenantMembershipTable)
            .values({ tenantId: tenant.id, userId: user.id }),
        ),
      )
    } else {
      await db
        .insert(TenantMembershipTable)
        .values({ tenantId: tenant.id, userId: tenant.createdById })
    }

    return tenant
  },
  createWithoutDb(data) {
    return {
      createdAt: new Date(),
      id: randomUUID(),
      externalId: randomUUID(),
      updatedAt: null,

      ...data,
    }
  },
})
