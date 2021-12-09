import React, { useEffect } from 'react'

import BridgeHost from '../bridge/host'
import {
  ForkProvider,
  useGanacheProvider,
  useWalletConnectProvider,
  WrappingProvider,
} from '../providers'
import {} from '../providers/ProvideGanache'
import {} from '../providers/ProvideWalletConnect'

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
  const { provider: walletConnectProvider } = useWalletConnectProvider()
  const ganacheProvider = useGanacheProvider()

  useEffect(() => {
    if (!walletConnectProvider) return

    // const provider = new WrappingProvider(
    //   walletConnectProvider,
    //   pilotAddress,
    //   moduleAddress,
    //   avatarAddress
    // )
    const provider = new ForkProvider(ganacheProvider, avatarAddress)
    const bridgeHost = new BridgeHost(provider)
    const handle = (ev: MessageEvent<any>) => bridgeHost.handleMessage(ev)
    window.addEventListener('message', handle)

    return () => {
      window.removeEventListener('message', handle)
    }
  }, [
    pilotAddress,
    moduleAddress,
    avatarAddress,
    walletConnectProvider,
    ganacheProvider,
  ])

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
