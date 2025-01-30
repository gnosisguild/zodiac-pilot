import type { TokenBalance } from '@/balances-server'
import {
  EvmNative,
  type EvmErc20TokenBalanceWithPriceJSON,
} from '@moralisweb3/common-evm-utils'
import { formatUnits } from 'viem'

export const createMockTokenBalance = ({
  decimals = 18,
  balance = '0',
  ...tokenBalance
}: Partial<EvmErc20TokenBalanceWithPriceJSON> = {}): TokenBalance => {
  const evmNativeBalance = EvmNative.fromJSON(balance)

  return {
    name: 'Test token',
    symbol: 'T€5T',
    decimals,
    balance,
    balance_formatted: formatUnits(evmNativeBalance.value.toBigInt(), decimals),
    possible_spam: false,
    native_token: true,
    portfolio_percentage: 0,
    usd_price: '0',
    usd_price_24hr_percent_change: '0',
    usd_price_24hr_usd_change: '0',
    usd_value: 0,

    ...tokenBalance,
  }
}
