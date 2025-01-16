import { Chain, ZERO_ADDRESS } from '@zodiac/chains'
import { AccountType, formatPrefixedAddress, type Account } from 'ser-kit'

type Eoa = Extract<Account, { type: AccountType.EOA }>

export const createMockEoaAccount = (eoa: Partial<Eoa> = {}): Eoa => ({
  type: AccountType.EOA,
  address: ZERO_ADDRESS,
  prefixedAddress: formatPrefixedAddress(Chain.ETH, ZERO_ADDRESS),

  ...eoa,
})
