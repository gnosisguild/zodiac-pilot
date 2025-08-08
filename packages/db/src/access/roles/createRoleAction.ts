import { Role, RoleActionTable, RoleActionType, User } from '@zodiac/db/schema'
import { DBClient } from '../../dbClient'

type CreateRoleActionOptions = {
  label: string
  type: RoleActionType
  key: string
}

export const createRoleAction = async (
  db: DBClient,
  role: Role,
  user: User,
  { label, type, key }: CreateRoleActionOptions,
) => {
  const [action] = await db
    .insert(RoleActionTable)
    .values({
      label,
      key,
      type,
      createdById: user.id,
      roleId: role.id,
      tenantId: role.tenantId,
      workspaceId: role.workspaceId,
    })
    .returning()

  return action
}
