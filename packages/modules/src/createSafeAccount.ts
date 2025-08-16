import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  ExecutionAccount,
  prefixAddress,
  type ChainId,
} from 'ser-kit'

type Safe = Extract<ExecutionAccount, { type: AccountType.SAFE }>

export type CreateSafeAccountOptions = {
  chainId: ChainId
  address: HexAddress
}

export const createSafeAccount = ({
  chainId,
  address,
}: CreateSafeAccountOptions): Safe => ({
  type: AccountType.SAFE,
  threshold: NaN,
  address,
  chain: chainId,
  prefixedAddress: prefixAddress(chainId, address),
})
