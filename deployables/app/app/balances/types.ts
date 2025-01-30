import type Moralis from 'moralis'

export type BalanceResult = Awaited<
  ReturnType<(typeof Moralis.EvmApi.wallets)['getWalletTokenBalancesPrice']>
>['result']

export type TokenBalance = BalanceResult[number]
