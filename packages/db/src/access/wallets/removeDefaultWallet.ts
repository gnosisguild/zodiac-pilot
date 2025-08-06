import { ChainId } from '@zodiac/chains'
import { DefaultWalletTable, User } from '@zodiac/db/schema'
import { and, eq } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

export const removeDefaultWallet = (
  db: DBClient,
  user: User,
  chainId: ChainId,
) =>
  db
    .delete(DefaultWalletTable)
    .where(
      and(
        eq(DefaultWalletTable.userId, user.id),
        eq(DefaultWalletTable.chainId, chainId),
      ),
    )
