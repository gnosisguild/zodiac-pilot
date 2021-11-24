import React, { useEffect } from 'react'

import { useWalletConnectClient } from '../WalletConnectProvider'
import BridgeHost from '../bridge/host'

import { useLocation } from './location'

const BrowserFrame: React.FC = () => {
  const location = useLocation()

  const provider = useWalletConnectClient()

  useEffect(() => {
    if (!provider) return

    const bridgeHost = new BridgeHost(provider)
    const handle = (ev: MessageEvent<any>) => bridgeHost.handleMessage(ev)
    window.addEventListener('message', handle)

    return () => {
      window.removeEventListener('message', handle)
    }
  }, [provider])

  return (
    <>
      <iframe
        title="Transaction Simulator"
        name="transaction-simulator"
        src={location}
        style={{ display: 'block', width: '100%', height: 900 }}
      />
    </>
  )
}

export default BrowserFrame
