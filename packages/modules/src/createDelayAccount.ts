import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  prefixAddress,
  type ChainId,
  type ExecutionAccount,
} from 'ser-kit'

type Delay = Extract<ExecutionAccount, { type: AccountType.DELAY }>

type CreateDelayAccountOptions = {
  chainId: ChainId
  address: HexAddress
}

export const createDelayAccount = ({
  address,
  chainId,
}: CreateDelayAccountOptions): Delay => ({
  type: AccountType.DELAY,
  address,
  prefixedAddress: prefixAddress(chainId, address),
  chain: chainId,
})
