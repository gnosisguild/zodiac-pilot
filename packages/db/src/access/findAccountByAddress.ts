import { invariant } from '@epic-web/invariant'
import { splitPrefixedAddress, type PrefixedAddress } from 'ser-kit'
import type { DBClient } from '../dbClient'

export const findAccountByAddress = async (
  db: DBClient,
  prefixedAddress: PrefixedAddress,
) => {
  const [chainId, address] = splitPrefixedAddress(prefixedAddress)

  invariant(chainId != null, 'Can only find safe accounts, not EOAs')

  const account = await db.query.account.findFirst({
    where(field, { eq, and }) {
      return and(eq(field.address, address), eq(field.chainId, chainId))
    },
  })

  return account
}
