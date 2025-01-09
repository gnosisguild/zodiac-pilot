import type { HexAddress } from '@zodiac/schema'
import { formatPrefixedAddress, type ChainId } from 'ser-kit'

export const randomHex = (size: number): HexAddress => {
  const hex = [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')

  return `0x${hex}`
}

export const randomAddress = (size: number = 40) => randomHex(size)

type RandomPrefixedAddressOptions = {
  chainId?: ChainId
  address?: HexAddress
}

export const randomPrefixedAddress = ({
  chainId = 1,
  address = randomAddress(),
}: RandomPrefixedAddressOptions = {}) => formatPrefixedAddress(chainId, address)
