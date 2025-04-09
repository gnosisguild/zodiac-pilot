import { and, eq } from 'drizzle-orm'
import type { DBClient } from '../dbClient'
import { ActiveAccountTable, type Tenant, type User } from '../schema'

export const activateAccount = (
  db: DBClient,
  tenant: Tenant,
  user: User,
  accountId: string,
) =>
  db.transaction(async (tx) => {
    await tx
      .delete(ActiveAccountTable)
      .where(
        and(
          eq(ActiveAccountTable.tenantId, tenant.id),
          eq(ActiveAccountTable.userId, user.id),
        ),
      )

    await tx
      .insert(ActiveAccountTable)
      .values({ accountId, tenantId: tenant.id, userId: user.id })
  })
