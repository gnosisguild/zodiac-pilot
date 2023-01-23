import React, { useEffect, useRef } from 'react'

import BridgeHost from '../bridge/host'
import { useConnection } from '../settings'

import { useProvider } from './ProvideProvider'

type Props = {
  src: string
}

const BrowserFrame: React.FC<Props> = ({ src }) => {
  const provider = useProvider()
  const { connection } = useConnection()
  const bridgeHostRef = useRef<BridgeHost | null>(null)

  useEffect(() => {
    if (!provider) return

    if (!bridgeHostRef.current) {
      bridgeHostRef.current = new BridgeHost(provider, connection)
    } else {
      bridgeHostRef.current.setProvider(provider)
      bridgeHostRef.current.setConnection(connection)
    }

    const handle = (ev: MessageEvent<any>) => {
      bridgeHostRef.current?.handleMessage(ev)
    }
    window.addEventListener('message', handle)

    return () => {
      window.removeEventListener('message', handle)
    }
  }, [provider, connection])

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
