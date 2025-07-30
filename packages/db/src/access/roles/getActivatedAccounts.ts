import { Account, AccountTable, ActivatedRoleTable } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { asc, eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type GetByWorkspace = {
  workspaceId: UUID
}

type GetByRole = {
  roleId: UUID
}

type GetActivatedAccountsOptions = GetByWorkspace | GetByRole

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

const getWhere = (options: GetActivatedAccountsOptions) => {
  if ('workspaceId' in options) {
    return eq(ActivatedRoleTable.workspaceId, options.workspaceId)
  }

  return eq(ActivatedRoleTable.roleId, options.roleId)
}
