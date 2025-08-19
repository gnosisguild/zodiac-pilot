import {
  Role,
  RoleDeployment,
  RoleDeploymentCreateInput,
  RoleDeploymentTable,
  User,
} from '@zodiac/db/schema'
import { randomUUID } from 'crypto'
import { createFactory } from './createFactory'

export const roleDeploymentFactory = createFactory<
  RoleDeploymentCreateInput,
  RoleDeployment,
  [createdBy: User, role: Role]
>({
  build(createdBy, role, data) {
    return {
      createdById: createdBy.id,
      roleId: role.id,
      tenantId: role.tenantId,
      workspaceId: role.workspaceId,

      ...data,
    }
  },
  async create(db, data) {
    const [deployment] = await db
      .insert(RoleDeploymentTable)
      .values(data)
      .returning()

    return deployment
  },
  createWithoutDb(input) {
    return {
      id: randomUUID(),

      cancelledAt: null,
      cancelledById: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: null,

      ...input,
    }
  },
})
