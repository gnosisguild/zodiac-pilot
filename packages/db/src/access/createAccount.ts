import type { ChainId } from '@zodiac/chains'
import { AccountTable, type Tenant, type User } from '@zodiac/db/schema'
import type { HexAddress } from '@zodiac/schema'
import type { DBClient } from '../dbClient'

type CreateAccountOptions = {
  label?: string
  chainId: ChainId
  address: HexAddress
}

export const createAccount = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
  { chainId, label, address }: CreateAccountOptions,
) => {
  const [account] = await db
    .insert(AccountTable)
    .values({
      tenantId: tenant.id,
      createdById: user.id,
      chainId,
      label,
      address,
    })
    .returning()

  return account
}
