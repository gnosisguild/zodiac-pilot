import { GhostButton } from '@/components'
import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { TransactionState, useDispatch, useTransactions } from '@/state'
import { Trash2 } from 'lucide-react'

type Props = {
  transactionState: TransactionState
  index: number
}

export const Remove = ({ transactionState, index }: Props) => {
  const provider = useProvider()
  const dispatch = useDispatch()
  const transactions = useTransactions()

  if (!(provider instanceof ForkProvider)) {
    // Removing transactions is only supported when using ForkProvider
    return null
  }

  const handleRemove = async () => {
    const laterTransactions = transactions.slice(index + 1)

    // remove the transaction and all later ones from the store
    dispatch({
      type: 'REMOVE_TRANSACTION',
      payload: { id: transactionState.id },
    })

    if (transactions.length === 1) {
      // no more recorded transaction remains: we can delete the fork and will create a fresh one once we receive the next transaction
      await provider.deleteFork()
      return
    }

    // revert to checkpoint before the transaction to remove
    await provider.request({
      method: 'evm_revert',
      params: [transactionState.snapshotId],
    })

    // re-simulate all transactions after the removed one
    for (const transaction of laterTransactions) {
      await provider.sendMetaTransaction(transaction.transaction)
    }
  }

  return (
    <GhostButton iconOnly icon={Trash2} onClick={handleRemove}>
      Remove transaction
    </GhostButton>
  )
}