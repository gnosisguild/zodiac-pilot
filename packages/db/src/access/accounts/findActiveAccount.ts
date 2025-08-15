import {
  AccountTable,
  ActiveAccountTable,
  type Tenant,
  type User,
} from '@zodiac/db/schema'
import { and, eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const findActiveAccount = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
) => {
  const [result] = await db
    .select()
    .from(AccountTable)
    .innerJoin(
      ActiveAccountTable,
      and(
        eq(ActiveAccountTable.tenantId, tenant.id),
        eq(ActiveAccountTable.userId, user.id),
        eq(ActiveAccountTable.accountId, AccountTable.id),
      ),
    )

  if (result == null) {
    return null
  }

  return result.Account
}
