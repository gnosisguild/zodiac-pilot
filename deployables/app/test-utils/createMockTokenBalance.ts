import type { TokenBalance } from '@/balances-server'
import { randomAddress } from '@zodiac/test-utils'

export const createMockTokenBalance = ({
  decimals = 18,
  amount = '0',
  ...tokenBalance
}: Partial<TokenBalance> = {}): TokenBalance => ({
  name: 'Test token',
  symbol: 'T€5T',
  decimals,
  amount,
  usdValue: 0,
  contractId: randomAddress(),
  logoUrl: null,

  ...tokenBalance,
})
