import { Chain } from '@zodiac/chains'
import { User, Wallet } from '@zodiac/db/schema'
import { Account, AccountType, predictAddress } from 'ser-kit'

export type Safe = Extract<Account, { type: AccountType.SAFE }>

export const predictMemberSafeAddress = (
  user: User,
  wallet: Wallet,
  chainId: Chain,
) =>
  predictAddress(
    {
      type: AccountType.SAFE,
      chain: chainId,
      modules: [],
      owners: [wallet.address],
      threshold: 1,
    } as Omit<Safe, 'address' | 'prefixedAddress'>,
    user.nonce,
  )
