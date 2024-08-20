// This is the entrypoint to the extension app. It is injected as a script tag from launch.ts so that it runs in the context of the external host.
// This means it does not have access to chrome.* APIs, but it can interact with other extensions such as MetaMask.
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import 'react-toastify/dist/ReactToastify.css'

import './global.css'

import Browser from './browser'
import RoutesDrawer from './routes/RoutesDrawer'
import ProvideProvider from './browser/ProvideProvider'
import { ProvideState } from './state'
import ZodiacToastContainer from './components/Toast'
import { pushLocation } from './location'
import { ProvideMetaMask } from './providers'
import { useMatchConnectionsRoute, usePushConnectionsRoute } from './routing'
import { ProvideRoutes } from './routes'
import { useRoutes, useUpdateLastUsedRoute } from './routes/routeHooks'

console.log('win', window, window.ethereum)

const Routes: React.FC = () => {
  const connectionsRouteMatch = useMatchConnectionsRoute()
  const pushConnectionsRoute = usePushConnectionsRoute()
  const [routes] = useRoutes()

  const isConnectionsRoute = connectionsRouteMatch.isMatch
  const routeSetupRequired = routes.length === 0

  useUpdateLastUsedRoute()

  // open connections drawer if a valid connection is not available
  useEffect(() => {
    if (!isConnectionsRoute && routeSetupRequired) {
      pushConnectionsRoute()
    }
  }, [isConnectionsRoute, routeSetupRequired, pushConnectionsRoute])

  return (
    <>
      <RoutesDrawer
        isOpen={routeSetupRequired || isConnectionsRoute}
        editConnectionId={connectionsRouteMatch.editConnectionId}
        onClose={() => pushLocation(connectionsRouteMatch.url)}
      />
      {!routeSetupRequired && <Browser />}
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
        <ProvideMetaMask>
          <ProvideProvider>
            <Routes />
            <ZodiacToastContainer />
          </ProvideProvider>
        </ProvideMetaMask>
      </ProvideRoutes>
    </ProvideState>
  </React.StrictMode>
)
