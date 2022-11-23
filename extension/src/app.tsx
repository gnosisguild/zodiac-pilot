// This is the entrypoint to the extension app. It is injected as a script tag from launch.ts so that it runs in the context of the external host.
// This means it does not have access to chrome.* APIs, but it can interact with other extensions such as MetaMask.
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import 'react-toastify/dist/ReactToastify.css'

import './global.css'

import Browser from './browser'
import { prependHttp } from './browser/UrlInput'
import ZodiacToastContainer from './components/Toast'
import { pushLocation } from './location'
import { ProvideMetaMask } from './providers'
import { useMatchSettingsRoute, usePushSettingsRoute } from './routing'
import Settings, { ProvideConnections, useConnection } from './settings'
import { validateAddress } from './utils'

const Routes: React.FC = () => {
  const settingsRouteMatch = useMatchSettingsRoute()
  const pushSettingsRoute = usePushSettingsRoute()
  const { connection, connected, connect } = useConnection()

  const isSettingsRoute = !!settingsRouteMatch
  const settingsRequired =
    !validateAddress(connection.avatarAddress) ||
    !validateAddress(connection.pilotAddress)
  const shallAutoConnect = !isSettingsRoute && !settingsRequired && !connected

  // redirect to settings page if more settings are required
  useEffect(() => {
    if (!isSettingsRoute && settingsRequired) {
      pushSettingsRoute()
    }
  }, [isSettingsRoute, pushSettingsRoute, settingsRequired])

  // if the active connection is ready to be launched, invoke the launch callback
  // (this will make sure the wallet is unlocked and connected to the correct network)
  useEffect(() => {
    if (shallAutoConnect && connect) {
      connect()
    }
  }, [shallAutoConnect, connect])

  if (!isSettingsRoute && settingsRequired) return null
  if (shallAutoConnect && connect) return null

  if (isSettingsRoute) {
    return (
      <Settings
        url={settingsRouteMatch.url}
        editConnectionId={settingsRouteMatch.editConnectionId}
        onLaunch={launch}
      />
    )
  }

  return <Browser />
}

function launch(url: string) {
  pushLocation(prependHttp(url))
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
