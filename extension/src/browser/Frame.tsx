import React, { useEffect, useRef } from 'react'

import Eip1193Bridge from '../bridge/Eip1193Bridge'
import SafeAppBridge from '../bridge/SafeAppBridge'
import { useConnection } from '../settings'

import { useProvider } from './ProvideProvider'

type Props = {
  src: string
}

const BrowserFrame: React.FC<Props> = ({ src }) => {
  const provider = useProvider()
  const { connection } = useConnection()
  const eip1193BridgeRef = useRef<Eip1193Bridge | null>(null)
  const safeAppBridgeRef = useRef<SafeAppBridge | null>(null)

  useEffect(() => {
    if (!provider) return

    // establish EIP-1193 bridge
    if (!eip1193BridgeRef.current) {
      eip1193BridgeRef.current = new Eip1193Bridge(provider, connection)
    } else {
      eip1193BridgeRef.current.setProvider(provider)
      eip1193BridgeRef.current.setConnection(connection)
    }

    // establish Safe App bridge
    if (!safeAppBridgeRef.current) {
      safeAppBridgeRef.current = new SafeAppBridge(provider, connection)
    } else {
      safeAppBridgeRef.current.setProvider(provider)
      safeAppBridgeRef.current.setConnection(connection)
    }

    const handle = (ev: MessageEvent<any>) => {
      eip1193BridgeRef.current?.handleMessage(ev)
      safeAppBridgeRef.current?.handleMessage(ev)
    }
    window.addEventListener('message', handle)
    console.log('messages will be handled')

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
