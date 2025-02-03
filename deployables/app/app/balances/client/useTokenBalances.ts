import { useEffect, useMemo } from 'react'
import { useFetcher } from 'react-router'
import { useAccount } from 'wagmi'
import type { BalanceResult, StrictTokenBalance } from '../types'

export const useTokenBalances = () => {
  const { address, chainId } = useAccount()
  const { load, data = [], state } = useFetcher<BalanceResult>()

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
          if (token.token_address == null) {
            return result
          }

          return {
            ...result,
            [token.token_address]: token as StrictTokenBalance,
          }
        },
        {} as Record<string, StrictTokenBalance>,
      ),
    [data],
  )

  return [{ data, tokenBalanceByAddress }, state] as const
}
