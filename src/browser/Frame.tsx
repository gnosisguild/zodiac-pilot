import React, { useEffect } from 'react'

import { useWalletConnectClient } from '../WalletConnectProvider'
import { Eip1193Provider } from '../bridge/Eip1193Provider'
import BridgeHost from '../bridge/host'

import { useLocation } from './location'

type Props = {
  avatar: string
  targetModule: string
}

const BrowserFrame: React.FC<Props> = ({ avatar, targetModule }) => {
  const location = useLocation()
  const provider = useWalletConnectClient()

  useEffect(() => {
    if (!provider) return

    const providerEip1193 = new Eip1193Provider(
      provider,
      // provider.getSigner(),
      avatar,
      targetModule
    )
    const bridgeHost = new BridgeHost(providerEip1193)
    const handle = (ev: MessageEvent<any>) => bridgeHost.handleMessage(ev)
    window.addEventListener('message', handle)

    return () => {
      window.removeEventListener('message', handle)
    }
  }, [avatar, targetModule, provider])

  return (
    <iframe
      title="Transaction Simulator"
      name="transaction-simulator"
      src={location}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  )
}

export default BrowserFrame
