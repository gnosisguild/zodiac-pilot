import { useAccount } from '@/accounts'
import { sentry } from '@/sentry'
import { useEffect } from 'react'
import { decodeTransaction } from './actions'
import { fetchContractInfo } from './fetchContractInfo'
import { useDispatch, usePendingTransactions } from './TransactionsContext'

export const useDecodeTransactions = () => {
  const pendingTransactions = usePendingTransactions()
  const { chainId } = useAccount()
  const dispatch = useDispatch()

  useEffect(() => {
    for (const transaction of pendingTransactions) {
      if (transaction.contractInfo != null) {
        continue
      }

      fetchContractInfo(transaction.to, chainId)
        .then((contractInfo) => {
          dispatch(decodeTransaction({ id: transaction.id, contractInfo }))
        })
        .catch((error) => {
          sentry.captureException(error)
        })
    }
  }, [chainId, dispatch, pendingTransactions])
}
