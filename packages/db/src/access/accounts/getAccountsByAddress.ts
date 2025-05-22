import { invariant } from '@epic-web/invariant'
import { splitPrefixedAddress, type PrefixedAddress } from 'ser-kit'
import type { DBClient } from '../../dbClient'

export const getAccountsByAddress = (
  db: DBClient,
  prefixedAddress: PrefixedAddress,
) => {
  const [chainId, address] = splitPrefixedAddress(prefixedAddress)

  invariant(chainId != null, 'Can only find safe accounts, not EOAs')

  return db.query.account.findMany({
    where(fields, { eq, and }) {
      return and(
        eq(fields.chainId, chainId),
        eq(fields.address, address),
        eq(fields.deleted, false),
      )
    },
  })
}
