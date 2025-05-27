import { useEffect } from 'react'
import { useProvider } from './ProvideProvider'
import {
  useDispatch,
  useRollback,
  useTransactions,
} from './TransactionsContext'
import { confirmRollbackTransaction } from './actions'

export const useRollbackTransaction = () => {
  const transactionToRollback = useRollback()
  const transactions = useTransactions()
  const dispatch = useDispatch()
  const provider = useProvider()

  useEffect(() => {
    if (transactionToRollback == null) {
      return
    }

    // This happens when there is only one transaction
    // and you roll it back. Effectively, we don't need to
    // do anything. When the last transaction is removed
    // the fork is removed as well, so there is nothing
    // to roll back
    if (transactions.length === 0) {
      dispatch(confirmRollbackTransaction({ id: transactionToRollback.id }))

      return
    }

    provider
      .request({
        method: 'evm_revert',
        params: [transactionToRollback.snapshotId],
      })
      .then(() => {
        dispatch(confirmRollbackTransaction({ id: transactionToRollback.id }))
      })
  }, [dispatch, provider, transactionToRollback, transactions.length])
}
