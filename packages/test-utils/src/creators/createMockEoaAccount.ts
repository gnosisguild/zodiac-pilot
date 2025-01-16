import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  formatPrefixedAddress,
  type Account,
  type ChainId,
} from 'ser-kit'

type Eoa = Extract<Account, { type: AccountType.EOA }>

type CreateMockEoaAccountOptions = {
  chainId?: ChainId
  address: HexAddress
}

export const createMockEoaAccount = (
  { address, chainId = Chain.ETH }: CreateMockEoaAccountOptions = {
    address: ZERO_ADDRESS,
  },
): Eoa => ({
  type: AccountType.EOA,
  address,
  prefixedAddress: formatPrefixedAddress(chainId, address),
})
