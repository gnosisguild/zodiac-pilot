import React, { useEffect } from 'react'

import { useWalletConnectProvider } from '../WalletConnectProvider'
import { Eip1193Provider } from '../bridge/Eip1193Provider'
import BridgeHost from '../bridge/host'

type Props = {
  src: string
  pilotAddress: string
  moduleAddress: string
  avatarAddress: string
}

const BrowserFrame: React.FC<Props> = ({
  src,
  pilotAddress,
  moduleAddress,
  avatarAddress,
}) => {
  const { provider } = useWalletConnectProvider()

  useEffect(() => {
    if (!provider) return

    const providerEip1193 = new Eip1193Provider(
      provider,
      pilotAddress,
      moduleAddress,
      avatarAddress
    )
    const bridgeHost = new BridgeHost(providerEip1193)
    const handle = (ev: MessageEvent<any>) => bridgeHost.handleMessage(ev)
    window.addEventListener('message', handle)

    return () => {
      window.removeEventListener('message', handle)
    }
  }, [pilotAddress, moduleAddress, avatarAddress, provider])

  return (
    <iframe
      id="pilot-frame"
      name="pilot-frame"
      title="Zodiac Pilot"
      src={src}
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
