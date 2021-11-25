import React, { useEffect } from 'react'

import { useWalletConnectClient } from '../WalletConnectProvider'
import { Eip1193Provider } from '../bridge/Eip1193Provider'
import BridgeHost from '../bridge/host'

import { useLocation } from './location'

type Props = {
  targetAvatar: string
}

const BrowserFrame: React.FC<Props> = ({ targetAvatar }) => {
  const location = useLocation()
  const { provider, connector } = useWalletConnectClient()

  useEffect(() => {
    if (!provider || !connector) return

    const providerEip1193 = new Eip1193Provider(
      provider,
      provider.getSigner(),
      connector,
      targetAvatar
    )
    const bridgeHost = new BridgeHost(providerEip1193)
    const handle = (ev: MessageEvent<any>) => bridgeHost.handleMessage(ev)
    window.addEventListener('message', handle)

    return () => {
      window.removeEventListener('message', handle)
    }
  }, [targetAvatar, provider, connector])

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
