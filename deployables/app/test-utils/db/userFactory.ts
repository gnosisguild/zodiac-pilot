import { UserTable, type Tenant, type User, type UserCreateInput } from '@/db'
import { createFactory } from './createFactory'

export const userFactory = createFactory<
  UserCreateInput,
  User,
  [tenant: Tenant]
>({
  build(tenant, data) {
    return {
      tenantId: tenant.id,

      ...data,
    }
  },
  async create(db, data) {
    const [user] = await db.insert(UserTable).values(data).returning()

    return user
  },
})
