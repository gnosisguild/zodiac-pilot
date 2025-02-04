import { useEffect, useMemo } from 'react'
import { useFetcher } from 'react-router'
import { useAccount } from 'wagmi'
import type { TokenBalance } from '../types'

export const useTokenBalances = () => {
  const { address, chainId } = useAccount()
  const { load, data = [], state } = useFetcher<TokenBalance[]>()

  useEffect(() => {
    if (address == null || chainId == null) {
      return
    }

    load(`/${address}/${chainId}/balances`)
  }, [address, chainId, load])

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

  return [{ data, tokenBalanceByAddress }, state] as const
}
