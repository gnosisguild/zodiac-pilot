import React, { useLayoutEffect, useRef } from 'react'

import Eip1193Bridge from '../bridge/Eip1193Bridge'
import SafeAppBridge, { SAFE_APP_WHITELIST } from '../bridge/SafeAppBridge'
import { useRoute } from '../routes'
import { asLegacyConnection } from '../routes/legacyConnectionMigrations'

import { useProvider } from './ProvideProvider'

type Props = {
  src: string
}

const BrowserFrame: React.FC<Props> = ({ src }) => {
  const provider = useProvider()
  const { route } = useRoute()
  const eip1193BridgeRef = useRef<Eip1193Bridge | null>(null)
  const safeAppBridgeRef = useRef<SafeAppBridge | null>(null)

  // We need the message listener to be set up before the iframe content window is loaded.
  // Otherwise we might miss the initial handshake message from the Safe SDK.
  // Using a layout effect ensures that the listeners are set synchronously after DOM flush.
  useLayoutEffect(() => {
    if (!provider) return

    const connection = asLegacyConnection(route)

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
      if (SAFE_APP_WHITELIST.includes(ev.origin)) {
        safeAppBridgeRef.current?.handleMessage(ev)
      }
    }
    window.addEventListener('message', handle)

    return () => {
      window.removeEventListener('message', handle)
    }
  }, [provider, route])

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
