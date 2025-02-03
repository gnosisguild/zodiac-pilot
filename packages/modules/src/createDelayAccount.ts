import type { HexAddress } from '@zodiac/schema'
import { AccountType, prefixAddress, type Account, type ChainId } from 'ser-kit'

type Delay = Extract<Account, { type: AccountType.DELAY }>

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
