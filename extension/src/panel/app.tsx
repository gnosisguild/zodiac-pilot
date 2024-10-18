// This is the entrypoint to the panel app.
// It has access to chrome.* APIs, but it can't interact with other extensions such as MetaMask.
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'

import './global.css'

import { parsePrefixedAddress } from 'ser-kit'
import ZodiacToastContainer from '../components/Toast'
import { update } from '../inject/bridge'
import { initPort } from './port'
import { ProvideInjectedWallet } from './providers'
import ProvideProvider, { useProvider } from './providers/ProvideProvider'
import { ProvideRoutes, RoutesEdit, RoutesList } from './routes'
import { useRoute, useUpdateLastUsedRoute } from './routes/routeHooks'
import { ProvideState } from './state'
import Transactions from './transactions'
import useStorage from './utils/useStorage'

initPort()

const router = createHashRouter([
  {
    path: '/',
    element: <Transactions />,
  },
  {
    path: '/routes',
    element: <RoutesList />,
  },
  {
    path: '/routes/:routeId',
    element: <RoutesEdit />,
  },
])

const App: React.FC = () => {
  // update the last used timestamp for the current route
  useUpdateLastUsedRoute()

  // make sure the injected provider stays updated on every relevant route change
  const { route, chainId } = useRoute()
  const provider = useProvider()
  const [, avatarAddress] = parsePrefixedAddress(route.avatar)
  useEffect(() => {
    update(provider, chainId, avatarAddress)
  }, [provider, chainId, avatarAddress])

  useStorage('lastUsedRoute', route.id)
  return (
    <>
      <RouterProvider router={router} />
      <ZodiacToastContainer />
    </>
  )
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('invariant violation')
const root = createRoot(rootEl)

root.render(
  <React.StrictMode>
    <ProvideState>
      <ProvideRoutes>
        <ProvideInjectedWallet>
          <ProvideProvider>
            <div className="p-6">
              <App />
            </div>
          </ProvideProvider>
        </ProvideInjectedWallet>
      </ProvideRoutes>
    </ProvideState>
  </React.StrictMode>
)

if (process.env.LIVE_RELOAD) {
  new EventSource(process.env.LIVE_RELOAD).addEventListener('change', (ev) => {
    const { added, removed, updated } = JSON.parse(ev.data)
    if (
      [...added, ...removed, ...updated].some((path) =>
        path.startsWith('/build/build/panel/')
      )
    ) {
      console.log('🔄 detected change, reloading panel...')
      location.reload()
    }
  })
}
