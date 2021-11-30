import React from 'react'
import ReactDom from 'react-dom'

import WalletConnectProvider from './WalletConnectProvider'
import './global.css'
import classNames from './app.module.css'
import Browser from './browser'
import { useLocation } from './location'
import Settings from './settings'

const Routes: React.FC = () => {
  const location = useLocation()

  if (location === 'settings') {
    return <Settings />
  }

  return <Browser />
}

ReactDom.render(
  <React.StrictMode>
    <WalletConnectProvider>
      <div className={classNames.page}>
        <Routes />
      </div>
    </WalletConnectProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
