import { and, eq } from 'drizzle-orm'
import type { DBClient } from '../dbClient'
import { ActiveAccountTable, type User } from '../schema'

export const activateAccount = (db: DBClient, user: User, accountId: string) =>
  db.transaction(async (tx) => {
    await tx
      .delete(ActiveAccountTable)
      .where(
        and(
          eq(ActiveAccountTable.tenantId, user.tenantId),
          eq(ActiveAccountTable.userId, user.id),
        ),
      )

    await tx
      .insert(ActiveAccountTable)
      .values({ accountId, tenantId: user.tenantId, userId: user.id })
  })
