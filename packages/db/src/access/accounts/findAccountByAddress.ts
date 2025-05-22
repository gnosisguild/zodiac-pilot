import { invariant } from '@epic-web/invariant'
import type { UUID } from 'crypto'
import { splitPrefixedAddress, type PrefixedAddress } from 'ser-kit'
import type { DBClient } from '../../dbClient'

type FindAccountByAddressOptions = {
  tenantId: UUID
  prefixedAddress: PrefixedAddress
}

export const findAccountByAddress = async (
  db: DBClient,
  { tenantId, prefixedAddress }: FindAccountByAddressOptions,
) => {
  const [chainId, address] = splitPrefixedAddress(prefixedAddress)

  invariant(chainId != null, 'Can only find safe accounts, not EOAs')

  const account = await db.query.account.findFirst({
    where(field, { eq, and }) {
      return and(
        eq(field.address, address),
        eq(field.chainId, chainId),
        eq(field.tenantId, tenantId),
        eq(field.deleted, false),
      )
    },
  })

  return account
}
