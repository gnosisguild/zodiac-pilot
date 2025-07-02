import { faker } from '@faker-js/faker'
import {
  TenantMembershipTable,
  UserTable,
  type Tenant,
  type User,
  type UserCreateInput,
} from '@zodiac/db/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const userFactory = createFactory<
  UserCreateInput,
  User,
  [tenant: Tenant]
>({
  build(_, data) {
    return {
      fullName: faker.person.fullName(),
      externalId: randomUUID(),

      ...data,
    }
  },
  async create(db, data, tenant) {
    const [user] = await db.insert(UserTable).values(data).returning()

    await db
      .insert(TenantMembershipTable)
      .values({ tenantId: tenant.id, userId: user.id })

    return user
  },
  createWithoutDb(data) {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      fullName: faker.person.fullName(),
      externalId: randomUUID(),
      updatedAt: null,

      ...data,
    }
  },
})
