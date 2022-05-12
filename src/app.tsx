import React, { useEffect } from 'react'
import ReactDom from 'react-dom'

import './global.css'
import Browser from './browser'
import { prependHttp } from './browser/UrlInput'
import { pushLocation, useLocation } from './location'
import Settings, { ProvideConnections } from './settings'
import { useConnection } from './settings'

const Routes: React.FC = () => {
  const location = useLocation()

  const { connection, connected } = useConnection()

  const settingsRequired =
    !connection ||
    !connection.avatarAddress ||
    !connection.moduleAddress ||
    !connected

  const settingsRouteMatch = location.startsWith('settings')

  // redirect to settings page if more settings are required
  useEffect(() => {
    if (!settingsRouteMatch && settingsRequired) {
      pushLocation(`settings;${location}`)
    }
  }, [location, settingsRouteMatch, settingsRequired])

  if (!settingsRouteMatch && settingsRequired) return null

  if (settingsRouteMatch) {
    return (
      <Settings
        url={location.startsWith('settings;') ? location.substring(9) : ''}
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
      <Routes />
    </ProvideConnections>
  </React.StrictMode>,
  document.getElementById('root')
)
