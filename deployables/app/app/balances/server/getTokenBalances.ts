import type { ChainId } from '@zodiac/chains'
import { getMoralisApiKey } from '@zodiac/env'
import type { HexAddress } from '@zodiac/schema'
import Moralis from 'moralis'
import type { Ref } from 'react'
import type { BalanceResult } from '../types'

const startedRef: Ref<boolean> = { current: false }

export const getTokenBalances = async (
  chainId: ChainId,
  address: HexAddress,
): Promise<BalanceResult> => {
  if (startedRef.current === false) {
    startedRef.current = true

    await Moralis.start({
      apiKey: getMoralisApiKey(),
    })
  }

  const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
    chain: chainId.toString(),
    address,
  })

  return response.result.filter((result) => !result.possibleSpam)
}
