import { AccountType, type Account } from 'ser-kit'
import { randomAddress, randomPrefixedAddress } from './randomHex'

type Eoa = Extract<Account, { type: AccountType.EOA }>

export const createMockEoaAccount = (eoa: Partial<Eoa> = {}): Eoa => ({
  type: AccountType.EOA,
  address: randomAddress(),
  prefixedAddress: randomPrefixedAddress(),

  ...eoa,
})
