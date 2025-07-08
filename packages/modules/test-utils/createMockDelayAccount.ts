import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { AccountType, prefixAddress, type Account, type ChainId } from 'ser-kit'

type Delay = Extract<Account, { type: AccountType.DELAY }>

export type CreateDelayAccountOptions = {
  address?: HexAddress
  chainId?: ChainId
}

export const createMockDelayAccount = ({
  address = ZERO_ADDRESS,
  chainId = Chain.ETH,
}: CreateDelayAccountOptions = {}): Delay => ({
  type: AccountType.DELAY,
  address,
  chain: chainId,
  prefixedAddress: prefixAddress(chainId, address),
})
