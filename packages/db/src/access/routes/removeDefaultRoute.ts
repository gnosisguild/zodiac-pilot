import { DefaultRouteTable, type Tenant, type User } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const removeDefaultRoute = (
  db: DBClient,
  tenant: Tenant,
  user: User,
  accountId: UUID,
) =>
  db
    .delete(DefaultRouteTable)
    .where(
      and(
        eq(DefaultRouteTable.tenantId, tenant.id),
        eq(DefaultRouteTable.userId, user.id),
        eq(DefaultRouteTable.accountId, accountId),
      ),
    )
