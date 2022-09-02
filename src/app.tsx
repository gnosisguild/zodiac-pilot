import React, { useEffect } from 'react'
import ReactDom from 'react-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './global.css'

import Browser from './browser'
import { prependHttp } from './browser/UrlInput'
import { pushLocation } from './location'
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

ReactDom.render(
  <React.StrictMode>
    <ProvideConnections>
      <ProvideTenderlySettings>
        <Routes />
        <ToastContainer />
      </ProvideTenderlySettings>
    </ProvideConnections>
  </React.StrictMode>,
  document.getElementById('root')
)
