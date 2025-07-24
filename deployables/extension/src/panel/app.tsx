// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can't interact with other extensions such as MetaMask.
import { sentry } from '@/sentry'
import { invariant } from '@epic-web/invariant'
import { PilotType, ToastContainer, ZodiacOsIcon } from '@zodiac/ui'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'
import '../global.css'
import { ProvidePort } from './port-handling'
import { routes } from './routes'

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
      <ProvidePort>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex items-center gap-4">
            <ZodiacOsIcon className="size-8" />
            <PilotType className="h-8 dark:invert" />
          </div>

          <span className="mt-8 animate-pulse">Loading...</span>
        </div>

        <div className="absolute inset-0 flex h-full flex-1 flex-col">
          <RouterProvider router={router} />
        </div>

        <ToastContainer position="top-center" />
      </ProvidePort>
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

export default {}
