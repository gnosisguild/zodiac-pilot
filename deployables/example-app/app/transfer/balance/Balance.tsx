import { Value } from '@/components'
import type { Address } from 'viem'
import { ER20Balance } from './ERC20Balance'

type BalanceProps = {
  address: Address
  token?: Address
}

export const Balance = ({ address, token }: BalanceProps) => (
  <Value label="Balance">
    <ER20Balance address={address} token={token} />
  </Value>
)
