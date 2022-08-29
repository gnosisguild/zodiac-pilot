import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import './global.css'
import Browser from './browser'
import { prependHttp } from './browser/UrlInput'
import { pushLocation } from './location'
import { ProvideMetaMask } from './providers'
import { useMatchSettingsRoute, usePushSettingsRoute } from './routing'
import Settings, {
  ProvideConnections,
  ProvideTenderlySettings,
} from './settings'
import { useConnection } from './settings'

const Routes: React.FC = () => {
  const settingsRouteMatch = useMatchSettingsRoute()
  const { connection, connected } = useConnection()
  const pushSettingsRoute = usePushSettingsRoute()

  const settingsRequired =
    !connection ||
    !connection.avatarAddress ||
    !connection.moduleAddress ||
    !connected

  // redirect to settings page if more settings are required
  useEffect(() => {
    if (!settingsRouteMatch && settingsRequired) {
      pushSettingsRoute()
    }
  }, [pushSettingsRoute, settingsRouteMatch, settingsRequired])
  if (!settingsRouteMatch && settingsRequired) return null

  if (settingsRouteMatch) {
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
        <ProvideTenderlySettings>
          <Routes />
        </ProvideTenderlySettings>
      </ProvideConnections>
    </ProvideMetaMask>
  </React.StrictMode>
)
