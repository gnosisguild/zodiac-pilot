import React, { useEffect } from 'react'
import ReactDom from 'react-dom'

import './global.css'
import Browser from './browser'
import { prependHttp } from './browser/UrlInput'
import { pushLocation, useLocation } from './location'
import { ProvideWalletConnect, useWalletConnectProvider } from './providers'
import Settings from './settings'

const Routes: React.FC = () => {
  const location = useLocation()
  const { connected } = useWalletConnectProvider()

  const avatarAddress = localStorage.getItem('avatarAddress') || ''
  const moduleAddress = localStorage.getItem('moduleAddress') || ''
  const settingsRequired = !connected || !avatarAddress || !moduleAddress
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
        moduleAddress={moduleAddress}
        avatarAddress={avatarAddress}
        onLaunch={launch}
      />
    )
  }

  return <Browser />
}

function launch(
  url: string,
  nextModuleAddress: string,
  nextAvatarAddress: string
) {
  localStorage.setItem('moduleAddress', nextModuleAddress)
  localStorage.setItem('avatarAddress', nextAvatarAddress)
  pushLocation(prependHttp(url))
}

ReactDom.render(
  <React.StrictMode>
    <ProvideWalletConnect>
      <Routes />
    </ProvideWalletConnect>
  </React.StrictMode>,
  document.getElementById('root')
)
