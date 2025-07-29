import { AccountTable, ActivatedRoleTable, Role } from '@zodiac/db/schema'
import { asc, eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

export const getActivatedAccounts = async (db: DBClient, role: Role) => {
  const results = await db
    .select()
    .from(ActivatedRoleTable)
    .where(eq(ActivatedRoleTable.roleId, role.id))
    .innerJoin(AccountTable, eq(AccountTable.id, ActivatedRoleTable.accountId))
    .orderBy(asc(AccountTable.label))

  return results.map(({ Account }) => Account)
}
