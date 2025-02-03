import type { HexAddress } from '@zodiac/schema'
import {
  parsePrefixedAddress,
  prefixAddress,
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
    return prefixAddress(undefined, address)
  }

  if (chainId != null) {
    return prefixAddress(chainId, address)
  }

  return prefixAddress(defaultChainId, address)
}
