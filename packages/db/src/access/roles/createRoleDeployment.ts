import { Role, RoleDeploymentTable, User } from '@zodiac/db/schema'
import { DBClient } from '../../dbClient'

export const createRoleDeployment = async (
  db: DBClient,
  user: User,
  role: Role,
) => {
  const [deployment] = await db
    .insert(RoleDeploymentTable)
    .values({
      roleId: role.id,
      workspaceId: role.workspaceId,
      tenantId: role.tenantId,
      createdById: user.id,
    })
    .returning()

  return deployment
}
