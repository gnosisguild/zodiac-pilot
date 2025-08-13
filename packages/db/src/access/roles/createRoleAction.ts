import { Role, RoleActionTable, RoleActionType, User } from '@zodiac/db/schema'
import { DBClient } from '../../dbClient'

type CreateRoleActionOptions = {
  label: string
  type: RoleActionType
}

export const createRoleAction = async (
  db: DBClient,
  role: Role,
  user: User,
  { label, type }: CreateRoleActionOptions,
) => {
  const [action] = await db
    .insert(RoleActionTable)
    .values({
      label,
      type,
      createdById: user.id,
      roleId: role.id,
      tenantId: role.tenantId,
      workspaceId: role.workspaceId,
    })
    .returning()

  return action
}
