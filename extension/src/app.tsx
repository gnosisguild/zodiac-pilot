// This is the entrypoint to the extension app. It is injected as a script tag from launch.ts so that it runs in the context of the external host.
// This means it does not have access to chrome.* APIs, but it can interact with other extensions such as MetaMask.
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import 'react-toastify/dist/ReactToastify.css'

import './global.css'

import Browser from './browser'
import ConnectionsDrawer from './connections/ConnectionsDrawer'
import ProvideProvider from './browser/ProvideProvider'
import { ProvideState } from './browser/state'
import ZodiacToastContainer from './components/Toast'
import { pushLocation } from './location'
import { ProvideMetaMask, ProvideTenderly } from './providers'
import { useMatchConnectionsRoute, usePushConnectionsRoute } from './routing'
import { ProvideConnections, useConnection } from './connections'
import {
  useConnections,
  useUpdateLastUsedConnection,
} from './connections/connectionHooks'
import { validateAddress } from './utils'

const Routes: React.FC = () => {
  const connectionsRouteMatch = useMatchConnectionsRoute()
  const pushConnectionsRoute = usePushConnectionsRoute()
  const { connection } = useConnection()

  const isConnectionsRoute = connectionsRouteMatch.isMatch
  const connectionChangeRequired = !validateAddress(connection.avatarAddress)

  const [connections] = useConnections()
  const connectionToEdit =
    connections.length === 1 ? connections[0].id : undefined

  useUpdateLastUsedConnection()

  // open connections drawer if a valid connection is not available
  useEffect(() => {
    if (!isConnectionsRoute && connectionChangeRequired) {
      pushConnectionsRoute(connectionToEdit)
    }
  }, [
    isConnectionsRoute,
    pushConnectionsRoute,
    connectionToEdit,
    connectionChangeRequired,
  ])

  if (!isConnectionsRoute && connectionChangeRequired) return null

  return (
    <>
      <ConnectionsDrawer
        isOpen={connectionChangeRequired || isConnectionsRoute}
        editConnectionId={connectionsRouteMatch.editConnectionId}
        onClose={() => pushLocation(connectionsRouteMatch.url)}
      />
      <Browser />
    </>
  )
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('invariant violation')
const root = createRoot(rootEl)

root.render(
  <React.StrictMode>
    <ProvideState>
      <ProvideConnections>
        <ProvideMetaMask>
          <ProvideTenderly>
            <ProvideProvider simulate>
              <Routes />
              <ZodiacToastContainer />
            </ProvideProvider>
          </ProvideTenderly>
        </ProvideMetaMask>
      </ProvideConnections>
    </ProvideState>
  </React.StrictMode>
)
