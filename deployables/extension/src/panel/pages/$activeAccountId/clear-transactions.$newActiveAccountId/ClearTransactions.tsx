import { useClearTransactions } from '@/transactions'
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

  useEffect(() => {
    clearTransactions()

    submit(null, { method: 'post' })
  }, [clearTransactions, submit])

  return null
}

export default ClearTransactions
