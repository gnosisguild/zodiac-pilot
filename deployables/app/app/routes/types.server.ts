import type Moralis from 'moralis'

type MoralisResult = Awaited<
  ReturnType<(typeof Moralis.EvmApi.wallets)['getWalletTokenBalancesPrice']>
>['result']

type BalanceSuccess = { error: null; data: MoralisResult }
type BalanceError = { error: string }

export type BalanceResult = BalanceSuccess | BalanceError
