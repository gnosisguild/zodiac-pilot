import { Account as DBAccount } from '@zodiac/db/schema'
import { Account, AccountType, predictAddress } from 'ser-kit'

export type Roles = Extract<Account, { type: AccountType.ROLES }>

export const predictRolesModAddress = (account: DBAccount) =>
  predictAddress(
    {
      type: AccountType.ROLES,
      avatar: account.address,
      chain: account.chainId,
      modules: [],
      owner: account.address,
      roles: [],
      target: account.address,
      version: 2,
      multisend: [],
      allowances: [],
    } as Omit<Roles, 'address' | 'prefixedAddress'>,
    account.nonce,
  )
