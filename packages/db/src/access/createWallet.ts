import { WalletTable, type User } from '@zodiac/db/schema'
import type { HexAddress } from '@zodiac/schema'
import type { DBClient } from '../dbClient'
import { findWalletByAddress } from './findWalletByAddress'

type CreateWalletOptions = {
  label: string
  address: HexAddress
}

export const createWallet = async (
  db: DBClient,
  user: User,
  { label, address }: CreateWalletOptions,
) => {
  const existingWallet = await findWalletByAddress(db, user, address)

  if (existingWallet != null) {
    return existingWallet
  }

  const [wallet] = await db
    .insert(WalletTable)
    .values({
      address,
      belongsToId: user.id,
      label,
    })
    .returning()

  return wallet
}
