import { getTokenByAddress, type TokenBalance } from '@/balances-server'
import { formatUnits, parseUnits } from 'viem'

export const applyDeltaToBalances = async (
  existingTokenBalances: TokenBalance[],
  delta: Record<string, bigint>,
  chain: string,
): Promise<TokenBalance[]> => {
  const balanceByAddress = existingTokenBalances.reduce<
    Record<string, TokenBalance>
  >(
    (result, balance) => ({
      ...result,
      [balance.contractId.toLowerCase()]: balance,
    }),
    {},
  )

  // fetch token info for any tokens that are not in the existing balances
  const newTokenBalances = await Promise.all(
    Object.keys(delta)
      .filter((tokenAddress) => balanceByAddress[tokenAddress] == null)
      .map(async (tokenAddress) => {
        const info = await getTokenByAddress(chain, tokenAddress)

        if (info == null) {
          const decimals = 18
          const amount = formatUnits(0n, decimals) as `${number}`

          return {
            contractId: tokenAddress,
            name: 'Unknown Token',
            amount,
            logoUrl: '',
            symbol: '???',
            usdValue: 0,
            usdPrice: 0,
            decimals,
            chain,
          }
        }

        const decimals = info.decimals || 18
        const amount = formatUnits(0n, decimals) as `${number}`

        return {
          contractId: info.id,
          name: info.name,
          symbol: info.optimized_symbol || info.display_symbol || info.symbol,
          logoUrl: info.logo_url,
          amount,
          decimals,
          usdPrice: info.price || 0,
          usdValue: parseFloat(amount) * (info.price || 0),
          chain: info.chain,
        }
      }),
  )

  return [...newTokenBalances, ...existingTokenBalances].map((balance) => {
    if (delta[balance.contractId.toLowerCase()] == null) {
      return balance
    }
    const deltaBalance = delta[balance.contractId.toLowerCase()]
    const decimals = balance.decimals || 18
    const existingRaw = parseUnits(balance.amount, decimals)

    const newRaw = existingRaw + deltaBalance
    const finalRaw = newRaw < 0n ? 0n : newRaw

    const newAmount = formatUnits(finalRaw, decimals) as `${number}`
    const balanceDiff = formatUnits(deltaBalance, decimals) as `${number}`

    return {
      ...balance,
      diff: {
        amount: balanceDiff,
        usdValue: parseFloat(balanceDiff) * (balance.usdPrice || 0),
      },
      amount: newAmount,
      usdValue: parseFloat(newAmount) * (balance.usdPrice || 0),
    }
  })
}
