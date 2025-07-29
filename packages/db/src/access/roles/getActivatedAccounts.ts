import { Account, AccountTable, ActivatedRoleTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { and, asc, eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type GetActivatedAccountsOptions = {
  workspaceId: UUID
  roleId?: UUID
}

export const getActivatedAccounts = async (
  db: DBClient,
  options: GetActivatedAccountsOptions,
): Promise<Record<UUID, Account[]>> => {
  const results = await db
    .select()
    .from(ActivatedRoleTable)
    .where(getWhere(options))
    .innerJoin(AccountTable, eq(AccountTable.id, ActivatedRoleTable.accountId))
    .orderBy(asc(AccountTable.label))

  return results.reduce<Record<UUID, Account[]>>(
    (result, { Account, ActivatedRole }) => {
      if (ActivatedRole.roleId in result) {
        return {
          ...result,
          [ActivatedRole.roleId]: [...result[ActivatedRole.roleId], Account],
        }
      }

      return {
        ...result,
        [ActivatedRole.roleId]: [Account],
      }
    },
    {},
  )
}

const getWhere = ({ workspaceId, roleId }: GetActivatedAccountsOptions) => {
  const where = eq(ActivatedRoleTable.workspaceId, workspaceId)

  if (roleId != null) {
    return and(where, eq(ActivatedRoleTable.roleId, roleId))
  }

  return where
}
