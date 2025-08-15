import { HexAddress } from '@zodiac/schema'
import { UUID } from 'crypto'
import { DBClient } from '../../dbClient'
import { getWallets } from './getWallets'

export const getWalletLabels = async (
  db: DBClient,
  userId: UUID,
): Promise<Record<HexAddress, string>> => {
  const wallets = await getWallets(db, userId)

  return wallets.reduce(
    (result, wallet) => ({ ...result, [wallet.address]: wallet.label }),
    {},
  )
}
