import { useEffect } from 'react'
import { useRouteError } from 'react-router'
import { client } from './client'

export const SentryErrorBoundary = () => {
  const error = useRouteError()

  useEffect(() => {
    client.captureException(error)
  }, [error])

  return null
}
