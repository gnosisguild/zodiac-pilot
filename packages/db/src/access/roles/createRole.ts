import { RoleTable, Tenant, User } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

type CreateRoleOptions = {
  workspaceId: UUID
  label: string
  key: string
}

export const createRole = async (
  db: DBClient,
  user: User,
  tenant: Tenant,
  { label, key, workspaceId }: CreateRoleOptions,
) => {
  const [role] = await db
    .insert(RoleTable)
    .values({
      label,
      tenantId: tenant.id,
      workspaceId,
      createdById: user.id,
      key,
    })
    .returning()

  return role
}
