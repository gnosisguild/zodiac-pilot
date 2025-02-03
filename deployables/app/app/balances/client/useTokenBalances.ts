import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { useAccount } from 'wagmi'
import type { BalanceResult } from '../types'

export const useTokenBalances = () => {
  const { address, chainId } = useAccount()
  const { load, data = [], state } = useFetcher<BalanceResult>()

  useEffect(() => {
    if (address == null || chainId == null) {
      return
    }

    load(`/${address}/${chainId}/balances`)
  }, [address, chainId, load])

  return [data, state] as const
}
