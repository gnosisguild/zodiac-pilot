import {
  useDeleteFork,
  useRevertToSnapshot,
  useSendTransaction,
} from '@/providers-ui'
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
  const dispatch = useDispatch()
  const transaction = useTransaction(transactionId)
  const transactions = useTransactions()
  const sendTransaction = useSendTransaction()
  const deleteFork = useDeleteFork()
  const revertToSnapshot = useRevertToSnapshot()

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
          await deleteFork()
          return
        }

        if (isConfirmedTransaction(transaction)) {
          // revert to checkpoint before the transaction to remove
          await revertToSnapshot(transaction)
        }

        // re-simulate all transactions after the removed one
        for (const transaction of laterTransactions) {
          await sendTransaction(transaction)
        }
      }}
    >
      Remove transaction
    </GhostButton>
  )
}
