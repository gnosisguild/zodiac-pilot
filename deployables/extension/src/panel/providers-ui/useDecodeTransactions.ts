import { useAccount } from '@/accounts'
import { decodeTransaction, useDispatch, usePendingTransactions } from '@/state'
import { useEffect } from 'react'
import { fetchContractInfo } from '../utils'

export const useDecodeTransactions = () => {
  const pendingTransactions = usePendingTransactions()
  const { chainId } = useAccount()
  const dispatch = useDispatch()

  useEffect(() => {
    for (const transaction of pendingTransactions) {
      if (transaction.contractInfo != null) {
        continue
      }

      fetchContractInfo(transaction.to, chainId).then((contractInfo) => {
        dispatch(decodeTransaction({ id: transaction.id, contractInfo }))
      })
    }
  }, [chainId, dispatch, pendingTransactions])
}
