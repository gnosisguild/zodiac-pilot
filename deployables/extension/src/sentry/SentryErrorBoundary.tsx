import { Error as ErrorAlert } from '@zodiac/ui'
import { useEffect } from 'react'
import { useRouteError } from 'react-router'
import { client } from './client'

export const SentryErrorBoundary = () => {
  const error = useRouteError()

  useEffect(() => {
    client.captureException(error)
  }, [error])

  if (error instanceof Error) {
    return (
      <div className="m-4">
        <ErrorAlert title={error.message}>
          <pre className="overflow-auto text-xs">{error.stack}</pre>
        </ErrorAlert>
      </div>
    )
  }

  return (
    <div className="m-4">
      <ErrorAlert title="Something went wrong">
        <pre className="overflow-auto text-xs">
          {JSON.stringify(error, undefined, 2)}
        </pre>
      </ErrorAlert>
    </div>
  )
}
