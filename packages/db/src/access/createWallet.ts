import { WalletTable, type User } from '@zodiac/db/schema'
import type { HexAddress } from '@zodiac/schema'
import type { DBClient } from '../dbClient'

type CreateWalletOptions = {
  label: string
  address: HexAddress
}

export const createWallet = async (
  db: DBClient,
  user: User,
  { label, address }: CreateWalletOptions,
) => {
  const [wallet] = await db.insert(WalletTable).values({
    address,
    belongsToId: user.id,
    label,
  })

  return wallet
}
