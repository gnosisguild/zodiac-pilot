import {
  clearPersistedTransactionState,
  useClearTransactions,
  useTransactions,
} from '@/transactions'
import { invariantResponse } from '@epic-web/invariant'
import { useEffect } from 'react'
import { redirect, useSubmit, type ActionFunctionArgs } from 'react-router'

export const action = async ({ params }: ActionFunctionArgs) => {
  const { newActiveAccountId } = params

  invariantResponse(
    newActiveAccountId != null,
    'No new active route id provided',
  )

  return redirect(`/${newActiveAccountId}`)
}

const ClearTransactions = () => {
  const submit = useSubmit()
  const clearTransactions = useClearTransactions()
  const transactions = useTransactions()

  useEffect(() => {
    clearTransactions()
  }, [clearTransactions])

  useEffect(() => {
    if (transactions.length !== 0) {
      return
    }

    clearPersistedTransactionState().then(() =>
      submit(null, { method: 'post' }),
    )
  }, [submit, transactions.length])

  return null
}

export default ClearTransactions
