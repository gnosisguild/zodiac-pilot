import {
  AccountTable,
  ActiveRouteTable,
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
  const activeRoutes = await db
    .select()
    .from(RouteTable)
    .where(
      and(eq(RouteTable.tenantId, tenant.id), eq(RouteTable.fromId, walletId)),
    )
    .leftJoin(ActiveRouteTable, eq(ActiveRouteTable.routeId, RouteTable.id))
    .leftJoin(AccountTable, eq(ActiveRouteTable.accountId, AccountTable.id))
    .orderBy(asc(AccountTable.label))

  return activeRoutes.reduce<Account[]>((result, { Account }) => {
    if (Account == null) {
      return result
    }

    return [...result, Account]
  }, [])
}
