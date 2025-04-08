import { eq } from 'drizzle-orm'
import type { DBClient } from '../dbClient'
import { AccountTable, type User } from '../schema'

export const deleteAccount = (db: DBClient, user: User, accountId: string) =>
  db
    .update(AccountTable)
    .set({ deleted: true, deletedAt: new Date(), deletedById: user.id })
    .where(eq(AccountTable.id, accountId))
