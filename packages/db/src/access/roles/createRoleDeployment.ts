import { invariant } from '@epic-web/invariant'
import {
  ActiveRoleDeployment,
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
): Promise<ActiveRoleDeployment> => {
  const [{ completedAt, cancelledAt, cancelledById, ...deployment }] = await db
    .insert(RoleDeploymentTable)
    .values({
      roleId: role.id,
      workspaceId: role.workspaceId,
      tenantId: role.tenantId,
      createdById: user.id,
      issues,
    })
    .returning()

  invariant(completedAt == null, 'Deployment has already been completed')

  invariant(
    cancelledById == null && cancelledAt == null,
    'Deployment has already been cancelled',
  )

  return { completedAt, cancelledAt, cancelledById, ...deployment }
}
