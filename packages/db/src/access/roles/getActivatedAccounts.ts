import {
  Account,
  AccountTable,
  ActivatedRoleTable,
  Role,
} from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { asc, eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

export const getActivatedAccounts = async (
  db: DBClient,
  role?: Role,
): Promise<Record<UUID, Account[]>> => {
  const results = await db
    .select()
    .from(ActivatedRoleTable)
    .where(role == null ? undefined : eq(ActivatedRoleTable.roleId, role.id))
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
