import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  formatPrefixedAddress,
  type Account,
  type ChainId,
} from 'ser-kit'

type EOA = Extract<Account, { type: AccountType.EOA }>

export type CreateEoaAccountOptions = {
  chainId: ChainId
  address: HexAddress
}

export const createEoaAccount = ({
  chainId,
  address,
}: CreateEoaAccountOptions): EOA => ({
  type: AccountType.EOA,
  address,
  prefixedAddress: formatPrefixedAddress(chainId, address),
})
