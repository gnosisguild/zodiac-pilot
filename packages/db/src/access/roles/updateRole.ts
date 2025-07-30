import { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { RoleTable } from '../../../schema'
import { DBClient } from '../../dbClient'

type UpdateRoleOptions = {
  label: string
}

export const updateRole = (
  db: DBClient,
  roleId: UUID,
  { label }: UpdateRoleOptions,
) => db.update(RoleTable).set({ label }).where(eq(RoleTable.id, roleId))
