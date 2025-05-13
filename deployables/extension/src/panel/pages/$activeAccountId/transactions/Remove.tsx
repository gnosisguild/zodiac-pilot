import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import {
  clearTransactions,
  isConfirmedTransaction,
  useDispatch,
  useTransaction,
  useTransactions,
} from '@/state'
import { GhostButton } from '@zodiac/ui'
import { Trash2 } from 'lucide-react'

type Props = {
  transactionId: string
}

export const Remove = ({ transactionId }: Props) => {
  const provider = useProvider()
  const dispatch = useDispatch()
  const transaction = useTransaction(transactionId)
  const transactions = useTransactions()

  if (!(provider instanceof ForkProvider)) {
    // Removing transactions is only supported when using ForkProvider
    return null
  }

  return (
    <GhostButton
      iconOnly
      size="small"
      icon={Trash2}
      onClick={async () => {
        const index = transactions.indexOf(transaction)
        const laterTransactions = transactions.slice(index + 1)

        // remove the transaction and all later ones from the store
        dispatch(clearTransactions({ fromId: transaction.id }))

        if (transactions.length === 1) {
          // no more recorded transaction remains: we can delete the fork and will create a fresh one once we receive the next transaction
          await provider.deleteFork()
          return
        }

        if (isConfirmedTransaction(transaction)) {
          // revert to checkpoint before the transaction to remove
          await provider.request({
            method: 'evm_revert',
            params: [transaction.snapshotId],
          })
        }

        // re-simulate all transactions after the removed one
        for (const transaction of laterTransactions) {
          await provider.sendMetaTransaction(transaction)
        }
      }}
    >
      Remove transaction
    </GhostButton>
  )
}
