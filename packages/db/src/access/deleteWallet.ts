import { WalletTable, type User } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import type { DBClient } from '../dbClient'

export const deleteWallet = (db: DBClient, user: User, walletId: UUID) =>
  db
    .update(WalletTable)
    .set({ deleted: true, deletedAt: new Date(), deletedById: user.id })
    .where(and(eq(WalletTable.id, walletId)))
