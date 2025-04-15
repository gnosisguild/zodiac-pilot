import { invariantResponse } from '@epic-web/invariant'
import { useEffect } from 'react'
import { redirect, useSubmit, type ActionFunctionArgs } from 'react-router'
import { useClearTransactions } from './useClearTransactions'

export const action = async ({ params }: ActionFunctionArgs) => {
  const { newActiveRouteId } = params

  invariantResponse(newActiveRouteId != null, 'No new active route id provided')

  return redirect(`/${newActiveRouteId}`)
}

const ClearTransactions = () => {
  const clearTransactions = useClearTransactions()
  const submit = useSubmit()

  useEffect(() => {
    clearTransactions().then(() => submit(null, { method: 'post' }))
  }, [clearTransactions, submit])

  return null
}

export default ClearTransactions
