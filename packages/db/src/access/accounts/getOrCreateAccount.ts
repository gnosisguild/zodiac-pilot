import type { ChainId } from '@zodiac/chains'
import { AccountTable, type Tenant } from '@zodiac/db/schema'
import type { HexAddress } from '@zodiac/schema'
import type { UUID } from 'crypto'
import { prefixAddress } from 'ser-kit'
import type { DBClient } from '../../dbClient'
import { findAccountByAddress } from './findAccountByAddress'

type CreateAccountOptions = {
  label?: string | null
  workspaceId: UUID
  ownerId: UUID
  chainId: ChainId
  address: HexAddress
}

export const getOrCreateAccount = async (
  db: DBClient,
  tenant: Tenant,
  { chainId, label, address, ownerId, workspaceId }: CreateAccountOptions,
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
      createdById: ownerId,
      workspaceId,
      chainId,
      label,
      address,
    })
    .returning()

  return account
}
