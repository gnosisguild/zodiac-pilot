import { ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import {
  AccountType,
  ExecutionAccount,
  prefixAddress,
  type Account,
} from 'ser-kit'

type Eoa = Extract<Account, { type: AccountType.EOA }>

export const createMockEoaAccount = ({
  address = ZERO_ADDRESS,
}: CreateMockExecutionEoaAccountOptions = {}): Eoa => ({
  type: AccountType.EOA,
  address,
  prefixedAddress: prefixAddress(undefined, address),
})

type ExecutionEoa = Extract<ExecutionAccount, { type: AccountType.EOA }>

type CreateMockExecutionEoaAccountOptions = {
  address?: HexAddress
}

export const createMockEoaExecutionAccount = ({
  address = ZERO_ADDRESS,
}: CreateMockExecutionEoaAccountOptions = {}): ExecutionEoa => ({
  type: AccountType.EOA,
  address,
  prefixedAddress: prefixAddress(undefined, address),
})
