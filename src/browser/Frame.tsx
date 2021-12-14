import React, { useEffect } from 'react'

import BridgeHost from '../bridge/host'

import { useProvider } from './ProvideProvider'

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
  const provider = useProvider()

  useEffect(() => {
    if (!provider) return

    const bridgeHost = new BridgeHost(provider)
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
