import { useTransaction } from '@/transactions'
import {
  Transaction as Erc20ApproveTransaction,
  isApplicable as isErc20ApproveApplicable,
} from './Erc20Approve'

export const useFriendlyTransaction = (
  transactionId: string,
): {
  FriendlyTitle: React.ComponentType<{ transactionId: string }> | null
  FriendlyBody: React.ComponentType<{ transactionId: string }> | null
} => {
  const transaction = useTransaction(transactionId)

  // Check if this is an ERC20 approve transaction
  if (isErc20ApproveApplicable(transaction)) {
    return {
      FriendlyTitle: Erc20ApproveTransaction,
      FriendlyBody: Erc20ApproveTransaction,
    }
  }

  return {
    FriendlyTitle: null,
    FriendlyBody: null,
  }
}
