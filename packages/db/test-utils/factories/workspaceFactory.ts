import { faker } from '@faker-js/faker'
import {
  WorkspaceTable,
  type Tenant,
  type User,
  type Workspace,
  type WorkspaceCreateInput,
} from '@zodiac/db/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const workspaceFactory = createFactory<
  WorkspaceCreateInput,
  Workspace,
  [tenant: Tenant, createdBy: User]
>({
  build(tenant, user, data) {
    return {
      createdById: user.id,
      tenantId: tenant.id,
      label: faker.location.county(),

      ...data,
    }
  },
  async create(db, data) {
    const [workspace] = await db.insert(WorkspaceTable).values(data).returning()

    return workspace
  },
  createWithoutDb(data) {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      deleted: false,
      deletedAt: null,
      deletedById: null,
      updatedAt: null,

      ...data,
    }
  },
})
