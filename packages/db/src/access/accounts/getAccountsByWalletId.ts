import {
  AccountTable,
  RouteTable,
  type Account,
  type Tenant,
} from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { and, asc, eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const getAccountsByWalletId = async (
  db: DBClient,
  tenant: Tenant,
  walletId: UUID,
): Promise<Account[]> => {
  const route = db.$with('r').as(
    db
      .selectDistinct({ toId: RouteTable.toId })
      .from(RouteTable)
      .where(
        and(
          eq(RouteTable.fromId, walletId),
          eq(RouteTable.tenantId, tenant.id),
        ),
      ),
  )

  const result = await db
    .with(route)
    .select()
    .from(AccountTable)
    .where(eq(AccountTable.deleted, false))
    .innerJoin(route, eq(route.toId, AccountTable.id))
    .orderBy(asc(AccountTable.label))

  return result.map(({ Account }) => Account)
}
