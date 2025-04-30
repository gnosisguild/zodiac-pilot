import { Page, useIsDev } from '@/components'
import { Error as ErrorAlert, Info } from '@zodiac/ui'
import { isRouteErrorResponse, Outlet, useRouteError } from 'react-router'

const Main = () => <Outlet />

export default Main

export const ErrorBoundary = () => {
  return (
    <Page fullWidth>
      <Page.Main>
        <div className="mx-auto flex h-full w-2/3 flex-1 flex-col items-center justify-center gap-8">
          <ErrorAlert title="The Pilot app encountered an error">
            This part of the website is not working as intended. Please reload
            the page and if the error persists please reach out to us on Discord
            for further assistance.
          </ErrorAlert>

          <ErrorMessage />
        </div>
      </Page.Main>
    </Page>
  )
}

const ErrorMessage = () => {
  const error = useRouteError()
  const isDev = useIsDev()

  if (isRouteErrorResponse(error)) {
    return (
      <Info title={error.status === 404 ? '404' : 'Error'}>
        {error.statusText}
      </Info>
    )
  }

  if (error instanceof Error) {
    return (
      <Info title={error.message}>
        {isDev && (
          <div className="max-w-full overflow-scroll">
            <pre>{error.stack}</pre>
          </div>
        )}
      </Info>
    )
  }

  return null
}
