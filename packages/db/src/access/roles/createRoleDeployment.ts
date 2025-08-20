import {
  Role,
  RoleDeploymentIssue,
  RoleDeploymentTable,
  User,
} from '@zodiac/db/schema'
import { DBClient } from '../../dbClient'

type CreateRoleDeploymentOptions = {
  issues: RoleDeploymentIssue[]
}

export const createRoleDeployment = async (
  db: DBClient,
  user: User,
  role: Role,
  { issues }: CreateRoleDeploymentOptions,
) => {
  const [deployment] = await db
    .insert(RoleDeploymentTable)
    .values({
      roleId: role.id,
      workspaceId: role.workspaceId,
      tenantId: role.tenantId,
      createdById: user.id,
      issues,
    })
    .returning()

  return deployment
}
