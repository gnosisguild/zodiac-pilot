import EventEmitter from 'events'

import WalletConnectEip1193ProviderBase from '@walletconnect/ethereum-provider'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { RPC } from '../networks'
import { waitForMultisigExecution } from '../safe'
import { JsonRpcError } from '../types'
import { RequestArguments } from '@walletconnect/ethereum-provider/dist/types/types'

// Global states for providers and event targets
const providers: Record<
  string,
  Promise<WalletConnectEip1193Provider> | undefined
> = {}

class WalletConnectJsonRpcError extends Error implements JsonRpcError {
  data: { message: string; code: number; data: string }
  constructor(code: number, message: string, data: string) {
    super('WalletConnect - RPC Error: Internal JSON-RPC error.')
    this.data = {
      code,
      message,
      data,
    }
  }
}

class WalletConnectEip1193Provider extends EventEmitter {
  providerBase: WalletConnectEip1193ProviderBase

  constructor(providerBase: WalletConnectEip1193ProviderBase) {
    super()

    // every instance of useWalletConnect() hook adds a listener, so we can run out of the default limit of 10 listeners before a warning is emitted
    this.setMaxListeners(100)

    this.providerBase = providerBase

    // TODO check if this works, otherwise try `this.providerBase.signer.on('connect'`
    this.providerBase.on('connect', () => {
      const { chainId, accounts } = this.providerBase
      console.log('WalletConnect connected', chainId, accounts)
      this.emit('connect', { chainId })
    })

    this.providerBase.on('disconnect', (ev) => {
      console.log('WalletConnect disconnected', ev)
      this.emit('disconnect', ev)
    })
  }

  async request(request: {
    method: string
    params?: Array<any>
  }): Promise<any> {
    const { method } = request

    // make errors conform to EIP-1193
    const requestWithCorrectErrors = async (request: {
      method: string
      params?: Array<any>
    }) => {
      try {
        return await this.providerBase.request(request)
      } catch (err) {
        const { message, code, data } = err as {
          code: number
          message: string
          data: string
        }
        throw new WalletConnectJsonRpcError(code, message, data)
      }
    }

    if (method === 'eth_chainId') {
      const result = await requestWithCorrectErrors(request)
      // WalletConnect seems to return a number even though it must be a string value
      return typeof result === 'number' ? `0x${result.toString(16)}` : result
    }

    if (method === 'eth_sendTransaction') {
      const safeTxHash = (await requestWithCorrectErrors(request)) as string
      const txHash = await waitForMultisigExecution(
        this.providerBase,
        this.providerBase.chainId,
        safeTxHash
      )
      return txHash
    }

    return await requestWithCorrectErrors(request)
  }
}

interface WalletConnectResult {
  provider: WalletConnectEip1193Provider
  connected: boolean
  connect(): Promise<{ chainId: number; accounts: string[] }>
  disconnect(): void
  accounts: string[]
  chainId: number | null
}

const useWalletConnect = (connectionId: string): WalletConnectResult | null => {
  const [provider, setProvider] = useState<WalletConnectEip1193Provider | null>(
    null
  )
  const [connected, setConnected] = useState(
    provider ? provider.providerBase.connected : false
  )

  // effect to initialize the provider
  useEffect(() => {
    if (!providers[connectionId]) {
      providers[connectionId] = WalletConnectEip1193ProviderBase.init({
        projectId: '0f8a5e2cf60430a26274b421418e8a27',
        showQrModal: true,
        chains: [1],
        optionalChains: Object.keys(RPC).map((chainId) => Number(chainId)),
        rpcMap: RPC,
        qrModalOptions: {
          themeVariables: {
            '--wcm-z-index': '9999',
          },
        },
        // storageOptions: {},
      }).then((providerBase) => new WalletConnectEip1193Provider(providerBase))
    }

    providers[connectionId]!.then((provider) => setProvider(provider))
  }, [connectionId])

  // effect to subscribe to provider events
  useEffect(() => {
    if (!provider) return

    const handleConnection = () => {
      setConnected(true)
    }
    provider.on('connect', handleConnection)

    const handleDisconnection = () => {
      setConnected(false)
    }
    provider.on('disconnect', handleDisconnection)

    return () => {
      provider.removeListener('connect', handleConnection)
      provider.removeListener('disconnect', handleDisconnection)
    }
  }, [provider])

  const connect = useCallback(async () => {
    if (!provider) {
      throw new Error('provider not initialized')
    }
    // try {
    await provider.providerBase.disconnect()
    await provider.providerBase.enable()
    // } catch (e) {
    // When the user dismisses the modal, the connectors stays in a pending state and the modal won't open again.
    // This fixes it:
    // provider.signer.disconnect()
    // }

    return {
      chainId: provider.providerBase.chainId,
      accounts: provider.providerBase.accounts,
    }
  }, [provider])

  const disconnect = useCallback(() => {
    if (!provider) {
      throw new Error('provider not initialized')
    }

    provider.providerBase.disconnect()
  }, [provider])

  const packed = useMemo(
    () =>
      provider
        ? {
            provider,
            connected,
            connect,
            disconnect,
            accounts: connected ? provider.providerBase.accounts : [],
            chainId: connected ? provider.providerBase.chainId : null,
          }
        : null,
    [provider, connected, connect, disconnect]
  )

  return packed
}

export default useWalletConnect
