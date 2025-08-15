import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import {
  Account,
  AccountType,
  ExecutionAccount,
  prefixAddress,
  type ChainId,
} from 'ser-kit'

export type Safe = Extract<Account, { type: AccountType.SAFE }>
export type ExecutionSafe = Extract<
  ExecutionAccount,
  { type: AccountType.SAFE }
>

export type CreateMockSafeExecutionAccountOptions = {
  chainId?: ChainId
  address?: HexAddress
}

export const createMockSafeExecutionAccount = ({
  chainId = Chain.ETH,
  address = ZERO_ADDRESS,
}: CreateMockSafeExecutionAccountOptions = {}): ExecutionSafe => ({
  type: AccountType.SAFE,
  address,
  prefixedAddress: prefixAddress(chainId, address),
  chain: chainId,
  threshold: NaN,
})

export type CreateMockSafeAccountOptions =
  CreateMockSafeExecutionAccountOptions & { owners?: HexAddress[] }

export const createMockSafeAccount = ({
  owners = [],
  ...options
}: CreateMockSafeAccountOptions = {}): Safe => ({
  ...createMockSafeExecutionAccount(options),

  owners,
  modules: [],
})
