import { WalletTable } from '@zodiac/db/schema'
import type { UUID } from 'crypto'
import { eq } from 'drizzle-orm'
import type { DBClient } from '../dbClient'

export const updateWalletLabel = (
  db: DBClient,
  walletId: UUID,
  label: string,
) => db.update(WalletTable).set({ label }).where(eq(WalletTable.id, walletId))
