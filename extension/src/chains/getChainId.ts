import { invariant } from '@epic-web/invariant'
import {
  splitPrefixedAddress,
  type ChainId,
  type PrefixedAddress,
} from 'ser-kit'

export const getChainId = (address: PrefixedAddress): ChainId => {
  // atm, we don't yet support cross-chain routes, so can derive a general chainId from the avatar
  const [chainId] = splitPrefixedAddress(address)

  invariant(chainId != null, 'chainId is empty')

  return chainId
}
