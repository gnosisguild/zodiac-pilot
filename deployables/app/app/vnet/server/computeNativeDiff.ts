import { type TokenBalance } from '@/balances-server'
import { formatUnits, parseUnits } from 'viem'

const normalizeBalance = (
  value: string | bigint,
  decimals: number,
  precision = 12,
): bigint => {
  const numericString =
    typeof value === 'bigint' ? formatUnits(value, decimals) : value
  const truncated = parseFloat(numericString).toFixed(precision)
  return parseUnits(truncated, decimals)
}

export const computeNativeDiff = (
  baselineNative: TokenBalance,
  forkNativeBalance: bigint,
  precision = 12,
): bigint => {
  const baselineValue = normalizeBalance(
    baselineNative.amount,
    baselineNative.decimals,
    precision,
  )

  const forkValue = normalizeBalance(
    forkNativeBalance,
    baselineNative.decimals,
    precision,
  )

  return forkValue - baselineValue
}
