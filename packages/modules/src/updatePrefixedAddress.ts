import type { HexAddress } from '@zodiac/schema'
import {
  formatPrefixedAddress,
  parsePrefixedAddress,
  splitPrefixedAddress,
  type ChainId,
  type PrefixedAddress,
} from 'ser-kit'

type UpdatePrefixedAddressOptions = {
  chainId?: ChainId
  address?: HexAddress
}

export const updatePrefixedAddress = (
  prefixedAddress: PrefixedAddress,
  {
    chainId,
    address = parsePrefixedAddress(prefixedAddress),
  }: UpdatePrefixedAddressOptions,
) => {
  if (chainId != null) {
    return formatPrefixedAddress(chainId, address)
  }

  const [defaultChainId] = splitPrefixedAddress(prefixedAddress)

  return formatPrefixedAddress(defaultChainId, address)
}
