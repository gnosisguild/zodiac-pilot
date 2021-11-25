import React, { useEffect } from 'react'

import { useWalletConnectClient } from '../WalletConnectProvider'
import BridgeHost from '../bridge/host'

import { useLocation } from './location'

type Props = {
  targetAvatar: string
}

const BrowserFrame: React.FC<Props> = ({ targetAvatar }) => {
  const location = useLocation()
  const provider = useWalletConnectClient()

  useEffect(() => {
    if (!provider) return

    const bridgeHost = new BridgeHost(provider, targetAvatar)
    const handle = (ev: MessageEvent<any>) => bridgeHost.handleMessage(ev)
    window.addEventListener('message', handle)

    return () => {
      window.removeEventListener('message', handle)
    }
  }, [targetAvatar, provider])

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
