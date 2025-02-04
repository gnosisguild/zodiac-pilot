import { useEffect, useMemo } from 'react'
import { useFetcher } from 'react-router'
import { useAccount } from 'wagmi'
import type { TokenBalance } from '../types'
import { useForkUrl } from './ForkContext'

export const useTokenBalances = () => {
  const { address, chainId } = useAccount()
  const forkUrl = useForkUrl()
  const { load, data = [], state } = useFetcher<TokenBalance[]>()

  useEffect(() => {
    if (address == null || chainId == null) {
      return
    }

    const url = new URL(
      `/${address}/${chainId}/balances`,
      window.location.origin,
    )

    if (forkUrl != null) {
      url.searchParams.set('fork', forkUrl)
    }

    load(`${url.pathname}${url.search}`)
  }, [address, chainId, forkUrl, load])

  const tokenBalanceByAddress = useMemo(
    () =>
      data.reduce(
        (result, token) => {
          if (token.contractId == null) {
            return result
          }

          return {
            ...result,
            [token.contractId]: token,
          }
        },
        {} as Record<string, TokenBalance>,
      ),
    [data],
  )

  return [
    { data, tokenBalanceByAddress, isForked: forkUrl != null },
    state,
  ] as const
}
