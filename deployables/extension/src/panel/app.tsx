// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can't interact with other extensions such as MetaMask.
import { ProvideConnectProvider, ProvideInjectedWallet } from '@/providers'
import { invariant } from '@epic-web/invariant'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createHashRouter,
  createRoutesFromChildren,
  matchRoutes,
  RouterProvider,
  useLocation,
  useNavigationType,
} from 'react-router'
import { ToastContainer } from 'react-toastify'
import '../global.css'
import { pages } from './pages'
import { ProvidePort } from './port-handling'
import { ProvideState } from './state'

import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://92eff3b9c50f79131ca0cb813f4b9304@o4508675621912576.ingest.us.sentry.io/4508676512677888',
  integrations: [
    Sentry.reactRouterV7BrowserTracingIntegration({
      createRoutesFromChildren,
      useEffect,
      matchRoutes,
      useLocation,
      useNavigationType,
    }),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost'],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

const router = createHashRouter(pages)

const Root = () => {
  return (
    <StrictMode>
      <ProvidePort>
        <ProvideState>
          <ProvideConnectProvider>
            <ProvideInjectedWallet>
              <div className="flex h-full flex-1 flex-col">
                <RouterProvider router={router} />
              </div>

              <ToastContainer position="top-center" />
            </ProvideInjectedWallet>
          </ProvideConnectProvider>
        </ProvideState>
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
