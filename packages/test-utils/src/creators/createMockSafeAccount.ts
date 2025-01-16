import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  formatPrefixedAddress,
  type Account,
  type ChainId,
} from 'ser-kit'

export type Safe = Extract<Account, { type: AccountType.SAFE }>

type CreateMockSafeAccountOptions = {
  chainId?: ChainId
  address?: HexAddress
}

export const createMockSafeAccount = ({
  chainId = Chain.ETH,
  address = ZERO_ADDRESS,
}: CreateMockSafeAccountOptions = {}): Safe => ({
  type: AccountType.SAFE,
  address,
  prefixedAddress: formatPrefixedAddress(chainId, address),
  chain: chainId,
  threshold: NaN,
})
