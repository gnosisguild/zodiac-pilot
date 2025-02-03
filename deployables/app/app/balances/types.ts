import type { EvmErc20TokenBalanceWithPriceJSON } from '@moralisweb3/common-evm-utils'

export type TokenBalance = EvmErc20TokenBalanceWithPriceJSON
export type StrictTokenBalance = Omit<TokenBalance, 'token_address'> & {
  token_address: string
}
export type BalanceResult = TokenBalance[]
