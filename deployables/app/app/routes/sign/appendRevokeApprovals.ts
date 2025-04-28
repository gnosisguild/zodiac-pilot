import type { HexAddress, MetaTransactionRequest } from '@zodiac/schema'
import { encodeFunctionData, erc20Abi } from 'viem'

export const appendRevokeApprovals = (
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
