import type { DBClient } from '../dbClient'
import { WalletTable, type User } from '../schema'

type CreateWalletOptions = {
  label: string
  address: string
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
    tenantId: user.tenantId,
  })

  return wallet
}
