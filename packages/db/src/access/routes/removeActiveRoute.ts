import { ActiveRouteTable, type Tenant, type User } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const removeActiveRoute = (
  db: DBClient,
  tenant: Tenant,
  user: User,
  accountId: UUID,
) =>
  db
    .delete(ActiveRouteTable)
    .where(
      and(
        eq(ActiveRouteTable.tenantId, tenant.id),
        eq(ActiveRouteTable.userId, user.id),
        eq(ActiveRouteTable.accountId, accountId),
      ),
    )
