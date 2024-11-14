import { IconButton } from '@/components'
import { ForkProvider, useProvider } from '@/providers'
import { TransactionState, useDispatch, useTransactions } from '@/state'
import { RiDeleteBinLine } from 'react-icons/ri'

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
    <IconButton onClick={handleRemove} title="Remove transaction">
      <RiDeleteBinLine />
    </IconButton>
  )
}
