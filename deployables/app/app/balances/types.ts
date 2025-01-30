import type Moralis from 'moralis'

export type BalanceResult = ReturnType<
  Awaited<
    ReturnType<(typeof Moralis.EvmApi.wallets)['getWalletTokenBalancesPrice']>
  >['result'][number]['toJSON']
>[]

export type TokenBalance = BalanceResult[number]
