import { eq } from 'drizzle-orm'
import type { DBClient } from '../dbClient'
import { WalletTable, type User } from '../schema'

export const deleteWallet = (db: DBClient, user: User, walletId: string) =>
  db
    .update(WalletTable)
    .set({ deleted: true, deletedAt: new Date(), deletedById: user.id })
    .where(eq(WalletTable.id, walletId))
