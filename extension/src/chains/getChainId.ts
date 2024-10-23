import { invariant } from '@epic-web/invariant'
import { parsePrefixedAddress, PrefixedAddress } from 'ser-kit'

export const getChainId = (address: PrefixedAddress) => {
  // atm, we don't yet support cross-chain routes, so can derive a general chainId from the avatar
  const [chainId] = parsePrefixedAddress(address)

  invariant(chainId != null, 'chainId is empty')

  return chainId
}
