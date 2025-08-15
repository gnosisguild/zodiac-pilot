import { faker } from '@faker-js/faker'
import {
  Role,
  RoleCreateInput,
  RoleTable,
  Tenant,
  User,
} from '@zodiac/db/schema'
import { getRoleKey } from '@zodiac/modules'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const roleFactory = createFactory<
  RoleCreateInput,
  Role,
  [tenant: Tenant, createdBy: User]
>({
  build(tenant, createdBy, { label = faker.word.noun(), ...data } = {}) {
    return {
      createdById: createdBy.id,
      workspaceId: tenant.defaultWorkspaceId,
      tenantId: tenant.id,
      label,
      key: getRoleKey(label),

      ...data,
    }
  },
  async create(db, data) {
    const [role] = await db.insert(RoleTable).values(data).returning()

    return role
  },
  createWithoutDb(data) {
    return {
      createdAt: new Date(),
      id: randomUUID(),
      updatedAt: null,

      ...data,
    }
  },
})
