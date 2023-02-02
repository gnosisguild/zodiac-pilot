// This is the entrypoint to the extension app. It is injected as a script tag from launch.ts so that it runs in the context of the external host.
// This means it does not have access to chrome.* APIs, but it can interact with other extensions such as MetaMask.
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import 'react-toastify/dist/ReactToastify.css'

import './global.css'

import Browser from './browser'
import ConnectionsDrawer from './browser/ConnectionsDrawer'
import ZodiacToastContainer from './components/Toast'
import { pushLocation } from './location'
import { ProvideMetaMask } from './providers'
import { useMatchConnectionsRoute, usePushConnectionsRoute } from './routing'
import { ProvideConnections, useConnection } from './settings'
import {
  useConnections,
  useUpdateLastUsedConnection,
} from './settings/connectionHooks'
import { validateAddress } from './utils'

const Routes: React.FC = () => {
  const connectionsRouteMatch = useMatchConnectionsRoute()
  const pushConnectionsRoute = usePushConnectionsRoute()
  const { connection, connected } = useConnection()

  const isConnectionsRoute = connectionsRouteMatch.isMatch
  const connectionChangeRequired =
    !validateAddress(connection.avatarAddress) ||
    !validateAddress(connection.pilotAddress)

  const [connections] = useConnections()
  const connectionToEdit =
    connections.length === 1 ? connections[0].id : undefined

  const waitForWallet =
    !isConnectionsRoute && !connectionChangeRequired && !connected

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

  // open connections drawer if wallet is not connected, but only after a small delay to give the wallet time to connect when initially loading the page
  useEffect(() => {
    let timeout: number
    if (waitForWallet) {
      timeout = window.setTimeout(() => {
        pushConnectionsRoute()
      }, 200)
    }
    return () => {
      window.clearTimeout(timeout)
    }
  }, [waitForWallet, pushConnectionsRoute])

  if (!isConnectionsRoute && connectionChangeRequired) return null
  if (!isConnectionsRoute && waitForWallet) return null

  return (
    <>
      <ConnectionsDrawer
        isOpen={connectionChangeRequired || connectionsRouteMatch.isMatch}
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
    <ProvideMetaMask>
      <ProvideConnections>
        <Routes />
        <ZodiacToastContainer />
      </ProvideConnections>
    </ProvideMetaMask>
  </React.StrictMode>
)
