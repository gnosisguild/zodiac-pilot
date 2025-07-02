import type { ChainId } from '@zodiac/chains'
import { AccountTable, type Tenant, type User } from '@zodiac/db/schema'
import type { HexAddress } from '@zodiac/schema'
import { prefixAddress } from 'ser-kit'
import type { DBClient } from '../../dbClient'
import { findAccountByAddress } from './findAccountByAddress'

type CreateAccountOptions = {
  label?: string | null
  chainId: ChainId
  address: HexAddress
}

export const getOrCreateAccount = async (
  db: DBClient,
  tenant: Tenant,
  user: User,
  { chainId, label, address }: CreateAccountOptions,
) => {
  const existingAccount = await findAccountByAddress(db, {
    tenantId: tenant.id,
    prefixedAddress: prefixAddress(chainId, address),
  })

  if (existingAccount) {
    return existingAccount
  }

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
