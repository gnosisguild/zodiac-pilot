import { useTransaction } from '@/transactions'
import * as Erc20Approve from './Erc20Approve'

export const useFriendlyTransaction = (
  transactionId: string,
): {
  FriendlyTitle: React.ComponentType<{ transactionId: string }> | null
  FriendlyBody: React.ComponentType<{ transactionId: string }> | null
} => {
  const transaction = useTransaction(transactionId)

  // Check if this is an ERC20 approve transaction
  if (Erc20Approve.isApplicable(transaction)) {
    return {
      FriendlyTitle: Erc20Approve.Title,
      FriendlyBody: Erc20Approve.Body,
    }
  }

  return {
    FriendlyTitle: null,
    FriendlyBody: null,
  }
}
