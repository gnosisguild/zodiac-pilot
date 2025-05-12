// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can't interact with other extensions such as MetaMask.
import { sentry } from '@/sentry'
import { invariant } from '@epic-web/invariant'
import { AuthKitProvider } from '@workos-inc/authkit-react'
import { ToastContainer } from '@zodiac/ui'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'
import '../global.css'
import { ProvidePort } from './port-handling'
import { routes } from './routes'
import { ProvideState } from './state'

const router = createHashRouter(routes)

const Root = () => {
  useEffect(() => {
    const trackErrors = ({ error }: ErrorEvent) =>
      sentry.captureException(error)

    window.addEventListener('error', trackErrors)

    return () => {
      window.removeEventListener('error', trackErrors)
    }
  }, [])

  return (
    <StrictMode>
      <AuthKitProvider
        clientId={getWorkOSClientId()}
        redirectUri={`https://${chrome.runtime.id}.chromiumapp.org/callback`}
      >
        <ProvidePort>
          <ProvideState>
            <div className="flex h-full flex-1 flex-col">
              <RouterProvider router={router} />
            </div>

            <ToastContainer position="top-center" />
          </ProvideState>
        </ProvidePort>
      </AuthKitProvider>
    </StrictMode>
  )
}

const rootEl = document.getElementById('root')

invariant(rootEl != null, 'Could not find DOM node to attach app')

createRoot(rootEl).render(<Root />)

if (process.env.LIVE_RELOAD) {
  new EventSource(process.env.LIVE_RELOAD).addEventListener('change', (ev) => {
    const { added, removed, updated } = JSON.parse(ev.data)
    if (
      [...added, ...removed, ...updated].some((path) =>
        path.startsWith('/build/build/panel/'),
      )
    ) {
      console.debug('🔄 detected change, reloading panel...')
      location.reload()
    }
  })
}

const getWorkOSClientId = () => {
  const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID

  invariant(
    WORKOS_CLIENT_ID != null,
    '"WORKOS_CLIENT_ID" environment variable missing',
  )

  return WORKOS_CLIENT_ID
}

export default {}
