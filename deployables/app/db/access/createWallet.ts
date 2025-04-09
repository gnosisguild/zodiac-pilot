import type { HexAddress } from '@zodiac/schema'
import type { DBClient } from '../dbClient'
import { WalletTable, type Tenant, type User } from '../schema'

type CreateWalletOptions = {
  label: string
  address: HexAddress
}

export const createWallet = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
  { label, address }: CreateWalletOptions,
) => {
  const [wallet] = await db.insert(WalletTable).values({
    address,
    belongsToId: user.id,
    label,
    tenantId: tenant.id,
  })

  return wallet
}
