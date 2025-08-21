import { ChainId } from '@zodiac/chains'
import { DefaultWalletTable, WalletTable } from '@zodiac/db/schema'
import { HexAddress } from '@zodiac/schema'
import { UUID } from 'crypto'
import { and, eq, inArray } from 'drizzle-orm'
import { DBClient } from '../../dbClient'

type GetDefaultWalletLabelsOptions = {
  chainIds: ChainId[]
  userIds: UUID[]
}

export const getDefaultWalletLabels = async (
  db: DBClient,
  { userIds, chainIds }: GetDefaultWalletLabelsOptions,
) => {
  const result = await db
    .select()
    .from(DefaultWalletTable)
    .where(
      and(
        inArray(DefaultWalletTable.chainId, chainIds),
        inArray(DefaultWalletTable.userId, userIds),
      ),
    )
    .innerJoin(WalletTable, eq(DefaultWalletTable.walletId, WalletTable.id))

  return result.reduce<Record<HexAddress, string>>(
    (result, { Wallet }) => ({ ...result, [Wallet.address]: Wallet.label }),
    {},
  )
}
