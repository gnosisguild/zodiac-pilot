import { getChainId } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import {
  formatPrefixedAddress,
  parsePrefixedAddress,
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
    chainId = getChainId(prefixedAddress),
    address = parsePrefixedAddress(prefixedAddress),
  }: UpdatePrefixedAddressOptions,
) => formatPrefixedAddress(chainId, address)
