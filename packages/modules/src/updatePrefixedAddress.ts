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
  const [defaultChainId] = splitPrefixedAddress(prefixedAddress)

  if (defaultChainId == null) {
    return formatPrefixedAddress(undefined, address)
  }

  if (chainId != null) {
    return formatPrefixedAddress(chainId, address)
  }

  return formatPrefixedAddress(defaultChainId, address)
}
