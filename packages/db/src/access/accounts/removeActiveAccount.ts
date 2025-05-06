import { ActiveAccountTable, type Tenant, type User } from '@zodiac/db/schema'
import { and, eq } from 'drizzle-orm'
import type { DBClient } from '../../dbClient'

export const removeActiveAccount = (db: DBClient, tenant: Tenant, user: User) =>
  db
    .delete(ActiveAccountTable)
    .where(
      and(
        eq(ActiveAccountTable.tenantId, tenant.id),
        eq(ActiveAccountTable.userId, user.id),
      ),
    )
