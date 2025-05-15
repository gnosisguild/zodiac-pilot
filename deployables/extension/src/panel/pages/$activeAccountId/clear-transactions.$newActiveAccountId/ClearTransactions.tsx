import { clearTransactions, useDispatch } from '@/state'
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
  const dispatch = useDispatch()
  const submit = useSubmit()

  useEffect(() => {
    dispatch(clearTransactions())

    submit(null, { method: 'post' })
  }, [dispatch, submit])

  return null
}

export default ClearTransactions
