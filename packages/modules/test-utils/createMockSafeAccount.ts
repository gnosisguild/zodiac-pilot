import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  ExecutionAccount,
  prefixAddress,
  type ChainId,
} from 'ser-kit'

export type Safe = Extract<ExecutionAccount, { type: AccountType.SAFE }>

export type CreateMockSafeAccountOptions = {
  chainId?: ChainId
  address?: HexAddress
}

export const createMockSafeAccount = ({
  chainId = Chain.ETH,
  address = ZERO_ADDRESS,
}: CreateMockSafeAccountOptions = {}): Safe => ({
  type: AccountType.SAFE,
  address,
  prefixedAddress: prefixAddress(chainId, address),
  chain: chainId,
  threshold: NaN,
})
