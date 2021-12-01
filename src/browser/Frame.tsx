import React, { useEffect } from 'react'

import { useWalletConnectProvider } from '../WalletConnectProvider'
import { Eip1193Provider } from '../bridge/Eip1193Provider'
import BridgeHost from '../bridge/host'
import { useLocation } from '../location'

type Props = {
  avatarAddress: string
  targetAddress: string
}

const BrowserFrame: React.FC<Props> = ({ avatarAddress, targetAddress }) => {
  const location = useLocation()
  const { provider } = useWalletConnectProvider()

  useEffect(() => {
    if (!provider) return

    const providerEip1193 = new Eip1193Provider(
      provider,
      avatarAddress,
      targetAddress
    )
    const bridgeHost = new BridgeHost(providerEip1193)
    const handle = (ev: MessageEvent<any>) => bridgeHost.handleMessage(ev)
    window.addEventListener('message', handle)

    return () => {
      window.removeEventListener('message', handle)
    }
  }, [avatarAddress, targetAddress, provider])
  console.log('iframe', location)

  return (
    <iframe
      id="pilot-frame"
      name="pilot-frame"
      title="Transaction Pilot"
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
