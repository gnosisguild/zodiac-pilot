import { RoleAction, RoleActionTable } from '@zodiac/db/schema'
import { eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type UpdateRoleActionOptions = {
  label: string
}

export const updateRoleAction = (
  db: DBClient,
  action: RoleAction,
  { label }: UpdateRoleActionOptions,
) =>
  db
    .update(RoleActionTable)
    .set({ label })
    .where(eq(RoleActionTable.id, action.id))
