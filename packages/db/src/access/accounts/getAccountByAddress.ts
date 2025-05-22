import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import { type PrefixedAddress } from 'ser-kit'
import type { DBClient } from '../../dbClient'
import { findAccountByAddress } from './findAccountByAddress'

type GetAccountByAddressOptions = {
  tenantId: UUID
  prefixedAddress: PrefixedAddress
}

export const getAccountByAddress = async (
  db: DBClient,
  { tenantId, prefixedAddress }: GetAccountByAddressOptions,
) => {
  const account = await findAccountByAddress(db, { tenantId, prefixedAddress })

  invariant(
    account != null,
    `Could not find account for address "${prefixedAddress}".`,
  )

  return account
}
