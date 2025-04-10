import { AccountTable, type User } from '@zodiac/db/schema'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../dbClient'

export const deleteAccount = (db: DBClient, user: User, accountId: string) =>
  db
    .update(AccountTable)
    .set({ deleted: true, deletedAt: new Date(), deletedById: user.id })
    .where(eq(AccountTable.id, accountId))
