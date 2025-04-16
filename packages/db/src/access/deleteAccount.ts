import { AccountTable, type User } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../dbClient'

export const deleteAccount = (db: DBClient, user: User, accountId: UUID) =>
  db
    .update(AccountTable)
    .set({ deleted: true, deletedAt: new Date(), deletedById: user.id })
    .where(eq(AccountTable.id, accountId))
