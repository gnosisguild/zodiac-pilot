import {
  clearPersistedTransactionState,
  useClearTransactions,
  useTransactions,
} from '@/transactions'
import { invariant } from '@epic-web/invariant'
import { useEffect } from 'react'
import { useNavigate, useParams, useSubmit } from 'react-router'

const ClearTransactions = () => {
  const submit = useSubmit()
  const clearTransactions = useClearTransactions()
  const transactions = useTransactions()
  const navigate = useNavigate()
  const { newActiveAccountId } = useParams()

  invariant(newActiveAccountId != null, 'No new active route id provided')

  useEffect(() => {
    clearTransactions()
  }, [clearTransactions])

  useEffect(() => {
    if (transactions.length !== 0) {
      return
    }

    const abortController = new AbortController()

    clearPersistedTransactionState().then(() => {
      if (abortController.signal.aborted) {
        return
      }

      navigate(`/${newActiveAccountId}`)
    })

    return () => {
      abortController.abort('Newer submit')
    }
  }, [navigate, newActiveAccountId, submit, transactions.length])

  return null
}

export default ClearTransactions
