import type { ChainId } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import type { DBClient } from '../dbClient'
import { AccountTable, type User } from '../schema'

type CreateAccountOptions = {
  label?: string
  chainId: ChainId
  address: HexAddress
}

export const createAccount = async (
  db: DBClient,
  user: User,
  { chainId, label, address }: CreateAccountOptions,
) => {
  const [account] = await db
    .insert(AccountTable)
    .values({
      tenantId: user.tenantId,
      createdById: user.id,
      chainId,
      label,
      address,
    })
    .returning()

  return account
}
