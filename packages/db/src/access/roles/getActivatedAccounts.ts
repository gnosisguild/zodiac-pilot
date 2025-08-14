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

type AccountFragment = Pick<Account, 'id' | 'address' | 'chainId' | 'label'>

export async function getActivatedAccounts(
  db: DBClient,
  options: GetByWorkspace,
): Promise<Record<UUID, AccountFragment[]>>
export async function getActivatedAccounts(
  db: DBClient,
  options: GetByRole,
): Promise<Account[]>
export async function getActivatedAccounts(
  db: DBClient,
  options: GetActivatedAccountsOptions,
): Promise<Record<UUID, AccountFragment[]> | Account[]> {
  if ('roleId' in options) {
    const results = await db
      .select()
      .from(ActivatedRoleTable)
      .where(getWhere(options))
      .innerJoin(
        AccountTable,
        eq(AccountTable.id, ActivatedRoleTable.accountId),
      )
      .orderBy(asc(AccountTable.label))
    return results.map(({ Account }) => Account)
  }

  const results = await db
    .select({
      roleId: ActivatedRoleTable.roleId,
      account: {
        id: AccountTable.id,
        address: AccountTable.address,
        label: AccountTable.label,
        chainId: AccountTable.chainId,
      },
    })
    .from(ActivatedRoleTable)
    .where(getWhere(options))
    .innerJoin(AccountTable, eq(AccountTable.id, ActivatedRoleTable.accountId))
    .orderBy(asc(AccountTable.label))

  return results.reduce<Record<UUID, Account[]>>(
    (result, { roleId, account }) => {
      if (roleId in result) {
        return {
          ...result,
          [roleId]: [...result[roleId], account],
        }
      }

      return {
        ...result,
        [roleId]: [account],
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
