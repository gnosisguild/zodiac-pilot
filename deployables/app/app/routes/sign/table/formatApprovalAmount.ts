import { formatUnits } from 'viem'

const MAX_UINT256 = (1n << 256n) - 1n
const THRESHOLD = (MAX_UINT256 * 99n) / 100n

export const formatApprovalAmount = (
  approvalAmount: bigint,
  decimals: number,
  precision: number = 4,
): { display: string; tooltip: string } => {
  const amountBigInt = BigInt(approvalAmount)
  const amount = formatUnits(amountBigInt, decimals)
  if (amountBigInt >= THRESHOLD) {
    return {
      display: '∞',
      tooltip: amount,
    }
  }
  return {
    display: parseFloat(amount).toFixed(precision),
    tooltip: amount,
  }
}
