import { useEffect } from 'react'
import { redirect, useSubmit, type ActionFunctionArgs } from 'react-router'
import { useClearTransactions } from './useClearTransactions'

export const action = async ({ params }: ActionFunctionArgs) => {
  const { newActiveRouteId } = params

  return redirect(`/${newActiveRouteId}`)
}

export const ClearTransactions = () => {
  const clearTransactions = useClearTransactions()
  const submit = useSubmit()

  useEffect(() => {
    clearTransactions().then(() => submit(null, { method: 'post' }))
  }, [clearTransactions, submit])

  return null
}
