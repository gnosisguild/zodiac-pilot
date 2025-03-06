import { getTokenByAddress, type TokenBalance } from '@/balances-server'
import { formatUnits, parseUnits, type Log } from 'viem'

const ERC20_TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const decodeTransferLog = (log: Log) => {
  const from = '0x' + (log.topics[1]?.slice(26) || '')
  const to = '0x' + (log.topics[2]?.slice(26) || '')
  const valueHex = log.data
  const value = BigInt(valueHex).toString()
  return { from, to, value }
}

/**
 * Processes an array of transfer logs and updates the deltas record with the amounts transferred to the specified address.
 *
 * @param logs - An array of log objects representing transfer events.
 * @param address - The target address (avatar address) to check for incoming transfers.
 * @param deltas - A record object where the keys are token addresses and the values are the accumulated transfer amounts.
 *
 * @returns The updated deltas record with the amounts transferred to the specified address.
 */
export const processTransferLogs = (
  logs: Log[],
  address: string, //avatar address
  deltas: Record<string, bigint>,
) => {
  for (const log of logs) {
    if (log.topics[0]?.toLowerCase() === ERC20_TRANSFER_TOPIC) {
      const { to, from, value } = decodeTransferLog(log)
      const token = log.address.toLowerCase()
      const amount = BigInt(value)

      if (to.toLowerCase() === address.toLowerCase()) {
        // Avatar receives tokens => increment delta
        deltas[token] = (deltas[token] ?? 0n) + amount
      } else if (from.toLowerCase() === address.toLowerCase()) {
        // Avatar sends tokens => increment delta
        deltas[token] = (deltas[token] ?? 0n) - amount
      }
    }
  }
}

export const applyDeltaToBalances = async (
  mainnetBalance: TokenBalance[],
  delta: Record<string, bigint>,
  chain: string,
): Promise<TokenBalance[]> => {
  const balancesMap = new Map<string, TokenBalance>()
  for (const bal of mainnetBalance) {
    balancesMap.set(bal.contractId.toLowerCase(), { ...bal })
  }

  for (const [tokenAddress, deltaValue] of Object.entries(delta)) {
    const lowerAddr = tokenAddress.toLowerCase()
    const existing = balancesMap.get(lowerAddr)
    if (existing) {
      const decimals = existing.decimals || 18
      const existingRaw = parseUnits(existing.amount, decimals)
      const newRaw = existingRaw + deltaValue
      const finalRaw = newRaw < 0n ? 0n : newRaw

      const newAmount = formatUnits(finalRaw, decimals)
      existing.amount = newAmount
      existing.usdValue = parseFloat(newAmount) * (existing.usdPrice || 0)
      balancesMap.set(lowerAddr, existing)
    } else {
      const info = await getTokenByAddress(chain, tokenAddress)

      if (!info) {
        const decimals = 18
        const raw = deltaValue < 0n ? 0n : deltaValue
        const amount = formatUnits(raw, decimals)
        const newToken: TokenBalance = {
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
        balancesMap.set(lowerAddr, newToken)
      } else {
        const decimals = info.decimals || 18
        const raw = deltaValue < 0n ? 0n : deltaValue
        const amount = formatUnits(raw, decimals)

        const newToken: TokenBalance = {
          contractId: info.id,
          name: info.name || 'Unknown',
          symbol:
            info.optimized_symbol || info.display_symbol || info.symbol || '',
          logoUrl: info.logo_url || '',
          amount,
          decimals,
          usdPrice: info.price || 0,
          usdValue: parseFloat(amount) * (info.price || 0),
          chain: info.chain,
        }
        balancesMap.set(lowerAddr, newToken)
      }
    }
  }

  const finalBalances = Array.from(balancesMap.values())
  return finalBalances
}
