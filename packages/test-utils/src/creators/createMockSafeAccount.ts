import { AccountType, type Account } from 'ser-kit'
import { randomAddress, randomPrefixedAddress } from './randomHex'

export type Safe = Extract<Account, { type: AccountType.SAFE }>

export const createMockSafeAccount = (safe: Partial<Safe> = {}): Safe => ({
  type: AccountType.SAFE,
  address: randomAddress(),
  prefixedAddress: randomPrefixedAddress(),
  chain: 1,
  threshold: 0,

  ...safe,
})
