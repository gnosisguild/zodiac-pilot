import { useLastTransactionExecutedAt } from '@/components'
import { useAccount } from '@zodiac/web3'
import { useEffect, useMemo } from 'react'
import { useFetcher } from 'react-router'
import type { TokenBalance } from '../types'
import { useForkUrl } from './ForkContext'

export const useTokenBalances = () => {
  const { address, chainId } = useAccount()
  const { forkUrl, vnetId } = useForkUrl()
  const lastTransactionExecutedAt = useLastTransactionExecutedAt()
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

    if (vnetId != null) {
      url.searchParams.set('vnetId', vnetId)
    }

    load(`${url.pathname}${url.search}`)
  }, [address, chainId, forkUrl, vnetId, load, lastTransactionExecutedAt])

  const tokenBalanceByAddress = useMemo(
    () =>
      data.reduce<Record<string, TokenBalance>>((result, token) => {
        if (token.contractId == null) {
          return result
        }

        return {
          ...result,
          [token.contractId]: token,
        }
      }, {}),
    [data],
  )

  return [
    { data, tokenBalanceByAddress, isForked: forkUrl != null },
    state,
  ] as const
}
