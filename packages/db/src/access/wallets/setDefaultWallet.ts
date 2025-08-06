import { Chain } from '@zodiac/chains'
import { DefaultWalletTable, User } from '@zodiac/db/schema'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'

type SetDefaultWalletOptions = {
  walletId: UUID
  chainId: Chain
}

export const setDefaultWallet = (
  db: DBClient,
  user: User,
  { walletId, chainId }: SetDefaultWalletOptions,
) =>
  db
    .insert(DefaultWalletTable)
    .values({ userId: user.id, walletId, chainId })
    .onConflictDoUpdate({
      target: [DefaultWalletTable.chainId, DefaultWalletTable.userId],
      set: { walletId },
    })
