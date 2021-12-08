import React, { useEffect } from 'react'
import ReactDom from 'react-dom'

import './global.css'
import Browser from './browser'
import { pushLocation, useLocation } from './location'
import { ProvideWalletConnect, useWalletConnectProvider } from './providers'
import Settings from './settings'

const Routes: React.FC = () => {
  const location = useLocation()
  const { connected } = useWalletConnectProvider()

  const avatarAddress = localStorage.getItem('avatarAddress')
  const targetAddress = localStorage.getItem('targetAddress')
  const settingsRequired = !connected || !avatarAddress || !targetAddress
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
      />
    )
  }

  return <Browser />
}

ReactDom.render(
  <React.StrictMode>
    <ProvideWalletConnect>
      <Routes />
    </ProvideWalletConnect>
  </React.StrictMode>,
  document.getElementById('root')
)
