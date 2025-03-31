import type { HexAddress, MetaTransactionRequest } from '@zodiac/schema'
import { encodeFunctionData, erc20Abi, formatUnits } from 'viem'

export const appendApprovalTransactions = (
  metaTxs: MetaTransactionRequest[],
  approvalTxs: { spender: HexAddress; tokenAddress: HexAddress }[],
): MetaTransactionRequest[] => {
  if (approvalTxs.length === 0) {
    return metaTxs
  }

  const approvalCalls: MetaTransactionRequest[] = approvalTxs.map(
    (approval) => ({
      to: approval.tokenAddress,
      value: 0n,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [approval.spender, 0n],
      }),
    }),
  )

  return [...metaTxs, ...approvalCalls]
}

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
