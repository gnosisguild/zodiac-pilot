import { and, eq } from 'drizzle-orm'
import type { DBClient } from '../dbClient'
import { ActiveRouteTable, type User } from '../schema'

export const removeActiveRoute = (
  db: DBClient,
  user: User,
  accountId: string,
) =>
  db
    .delete(ActiveRouteTable)
    .where(
      and(
        eq(ActiveRouteTable.tenantId, user.tenantId),
        eq(ActiveRouteTable.userId, user.id),
        eq(ActiveRouteTable.accountId, accountId),
      ),
    )
