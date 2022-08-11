import EventEmitter from 'events'

import { nanoid } from 'nanoid'
import React, { useCallback, useState } from 'react'

import { JsonRpcRequest } from '../types'

// This renders an invisible iframe that runs outside the sandbox of our extension and handles JSON-RPC request via a window.postMessage bridge.
// An EIP-1193 provider is exposed via context.
const ProvideIframeBridge: React.FC<{
  children: React.ReactNode
  name: string
  contextProvider: React.Provider<IframeBridgeProvider | null>
}> = ({ children, name, contextProvider: ContextProvider }) => {
  const [provider, setProvider] = useState<IframeBridgeProviderInstance | null>(
    null
  )

  // Once the iframe is mounted we create the IframeBridgeProvider that calls to it.
  const ref = useCallback((frame: HTMLIFrameElement | null) => {
    if (frame?.contentWindow) {
      setProvider(new IframeBridgeProvider(frame.contentWindow))
    }
  }, [])

  return (
    <ContextProvider value={provider}>
      {provider && children}
      <iframe
        title={`iframe-bridge-${provider?.bridgeId}`}
        name={name}
        ref={ref}
        // This is just a basically empty page we use to inject our script.
        // We need a real host, though, for Chrome to initialize other extensions and give us permission to use Indexed DB
        src="https://ipfs.io/ipfs/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m"
        style={{ display: 'none' }}
      />
    </ContextProvider>
  )
}

export default ProvideIframeBridge

class IframeBridgeProvider extends EventEmitter {
  private iframeWindow: Window

  bridgeId = nanoid()
  private messageId = 0

  constructor(iframeWindow: Window) {
    super()
    this.iframeWindow = iframeWindow

    // TODO wait for zodiacPilotIframeBridgeInit message and delay sending any requests until then
  }

  request(request: JsonRpcRequest): Promise<any> {
    const currentMessageId = this.messageId
    this.messageId++

    return new Promise((resolve, reject) => {
      this.iframeWindow.postMessage(
        {
          zodiacPilotIframeBridgeRequest: true,
          request,
          bridgeId: this.bridgeId,
          messageId: currentMessageId,
        },
        '*'
      )

      const handleMessage = (ev: MessageEvent) => {
        const {
          zodiacPilotIframeBridgeResponse,
          bridgeId,
          messageId,
          error,
          response,
        } = ev.data
        if (
          (zodiacPilotIframeBridgeResponse && bridgeId === this.bridgeId,
          messageId === currentMessageId)
        ) {
          window.removeEventListener('message', handleMessage)
          console.debug('iframe bridge response', bridgeId, messageId, response)
          if (error) {
            reject(error)
          } else {
            resolve(response)
          }
        }
      }

      window.addEventListener('message', handleMessage)
    })
  }
}

export type IframeBridgeProviderInstance = InstanceType<
  typeof IframeBridgeProvider
>
