import { simulateTransactionBundle } from '@/simulation-server'
import type { MetaTransactionRequest, PrefixedAddress } from '@zodiac/schema'
import { appendRevokeApprovals } from './appendRevokeApprovals'

type Options = {
  revokeApprovals: boolean
}

export const revokeApprovalIfNeeded = async (
  safeAddress: PrefixedAddress,
  transactions: MetaTransactionRequest[],
  { revokeApprovals }: Options,
) => {
  if (revokeApprovals === false) {
    return transactions
  }

  const { approvals } = await simulateTransactionBundle(
    safeAddress,
    transactions,
    { omitTokenFlows: true },
  )

  if (approvals.length > 0) {
    return appendRevokeApprovals(transactions, approvals)
  }

  return transactions
}
