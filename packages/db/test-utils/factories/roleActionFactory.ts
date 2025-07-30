import { faker } from '@faker-js/faker'
import {
  Role,
  RoleAction,
  RoleActionCreateInput,
  RoleActionTable,
  RoleActionType,
  User,
} from '@zodiac/db/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const roleActionFactory = createFactory<
  RoleActionCreateInput,
  RoleAction,
  [role: Role, createdBy: User]
>({
  build(role, createdBy, data) {
    return {
      label: faker.word.noun(),
      type: RoleActionType.Swapper,

      createdById: createdBy.id,
      roleId: role.id,
      tenantId: role.tenantId,
      workspaceId: role.workspaceId,

      ...data,
    }
  },
  async create(db, data) {
    const [action] = await db.insert(RoleActionTable).values(data).returning()

    return action
  },
  createWithoutDb(data) {
    return {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: null,

      ...data,
    }
  },
})
