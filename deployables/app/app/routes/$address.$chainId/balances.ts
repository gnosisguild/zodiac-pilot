import { getMoralisApiKey } from '@zodiac/env'
import Moralis from 'moralis'
import type { Ref } from 'react'
import type { BalanceResult } from '../types.server'
import type { Route } from './+types/balances'

const startedRef: Ref<boolean> = { current: false }

export const loader = async ({
  params,
}: Route.LoaderArgs): Promise<BalanceResult> => {
  const { chainId, address } = params

  if (startedRef.current === false) {
    startedRef.current = true

    await Moralis.start({
      apiKey: getMoralisApiKey(),
    })
  }

  const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
    chain: chainId,
    address,
  })

  return response.result
}
