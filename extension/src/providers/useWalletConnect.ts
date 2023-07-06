import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { RPC } from '../networks'
import { waitForMultisigExecution } from '../safe'
import { JsonRpcError } from '../types'
import { RequestArguments } from '@walletconnect/ethereum-provider/dist/types/types'
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'

/**
 * Extends WalletConnectEthereumProvider to add support for keeping multiple WalletConnect connections active in parallel
 **/
class WalletConnectEthereumMultiProvider extends WalletConnectEthereumProvider {
  override readonly STORAGE_KEY: string

  constructor(connectionId: string) {
    super()
    this.STORAGE_KEY = `wc@2:ethereum_multi_provider:${connectionId}`
  }

  static override async init(
    opts: EthereumProviderOptions & { connectionId: string }
  ) {
    const provider = new WalletConnectEthereumMultiProvider(opts.connectionId)
    await provider.initialize(opts)
    return provider
  }

  override async request(request: RequestArguments): Promise<any> {
    const { method } = request

    // make errors conform to EIP-1193
    const requestWithCorrectErrors = async (request: RequestArguments) => {
      try {
        return await super.request(request)
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
        this.signer,
        this.chainId,
        safeTxHash
      )
      return txHash
    }

    return await requestWithCorrectErrors(request)
  }
}

// Global states for providers and event targets
const providers: Record<
  string,
  Promise<WalletConnectEthereumMultiProvider> | undefined
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

// class WalletConnectEip1193Provider extends EventEmitter {
//   providerBase: WalletConnectEthereumMultiProvider

//   constructor(providerBase: WalletConnectEthereumMultiProvider) {
//     super()

//     // every instance of useWalletConnect() hook adds a listener, so we can run out of the default limit of 10 listeners before a warning is emitted
//     this.setMaxListeners(100)

//     this.providerBase = providerBase

//     // TODO check if this works, otherwise try `this.providerBase.signer.on('connect'`
//     this.providerBase.on('connect', () => {
//       const { chainId, accounts } = this.providerBase
//       console.log('WalletConnect connected', chainId, accounts)
//       this.emit('connect', { chainId })
//     })

//     this.providerBase.on('disconnect', (ev) => {
//       console.log('WalletConnect disconnected', ev)
//       this.emit('disconnect', ev)
//     })
//   }

//   async request(request: {
//     method: string
//     params?: Array<any>
//   }): Promise<any> {
//     const { method } = request

//     // make errors conform to EIP-1193
//     const requestWithCorrectErrors = async (request: {
//       method: string
//       params?: Array<any>
//     }) => {
//       try {
//         return await this.providerBase.request(request)
//       } catch (err) {
//         const { message, code, data } = err as {
//           code: number
//           message: string
//           data: string
//         }
//         throw new WalletConnectJsonRpcError(code, message, data)
//       }
//     }

//     if (method === 'eth_chainId') {
//       const result = await requestWithCorrectErrors(request)
//       // WalletConnect seems to return a number even though it must be a string value
//       return typeof result === 'number' ? `0x${result.toString(16)}` : result
//     }

//     if (method === 'eth_sendTransaction') {
//       const safeTxHash = (await requestWithCorrectErrors(request)) as string
//       const txHash = await waitForMultisigExecution(
//         this.providerBase,
//         this.providerBase.chainId,
//         safeTxHash
//       )
//       return txHash
//     }

//     return await requestWithCorrectErrors(request)
//   }
// }

interface WalletConnectResult {
  provider: WalletConnectEthereumMultiProvider
  connected: boolean
  connect(): Promise<{ chainId: number; accounts: string[] }>
  disconnect(): void
  accounts: string[]
  chainId: number | null
}

const useWalletConnect = (connectionId: string): WalletConnectResult | null => {
  const [provider, setProvider] =
    useState<WalletConnectEthereumMultiProvider | null>(null)
  const [connected, setConnected] = useState(
    provider ? provider.connected : false
  )
  const [accounts, setAccounts] = useState(provider ? provider.accounts : [])
  const [chainId, setChainId] = useState(provider ? provider.chainId : 1)

  // effect to initialize the provider
  useEffect(() => {
    if (!providers[connectionId]) {
      providers[connectionId] = WalletConnectEthereumMultiProvider.init({
        connectionId,
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
      })
    }

    providers[connectionId]!.then((provider) => {
      setProvider(provider)
      setConnected(provider.connected)
      setAccounts(provider.accounts)
      setChainId(provider.chainId)
    })
  }, [connectionId])

  // effect to subscribe to provider events
  useEffect(() => {
    if (!provider) return

    const handleConnectionUpdate = () => {
      setConnected(provider.connected)
    }
    provider.events.on('connect', handleConnectionUpdate)
    provider.events.on('disconnect', handleConnectionUpdate)

    const handleAccountsChanged = () => {
      setAccounts(provider.accounts)
      setConnected(provider.connected && provider.accounts.length > 0)
    }
    provider.events.on('accountsChanged', handleAccountsChanged)

    const handleChainChanged = () => {
      setChainId(provider.chainId)
    }
    provider.events.on('chainChanged', handleChainChanged)

    return () => {
      provider.events.removeListener('connect', handleConnectionUpdate)
      provider.events.removeListener('disconnect', handleConnectionUpdate)
      provider.events.removeListener('accountsChanged', handleAccountsChanged)
      provider.events.removeListener('chainChanged', handleChainChanged)
    }
  }, [provider])

  const connect = useCallback(async () => {
    if (!provider) {
      throw new Error('provider not initialized')
    }
    // try {
    await provider.disconnect()
    await provider.enable()
    // } catch (e) {
    // When the user dismisses the modal, the connectors stays in a pending state and the modal won't open again.
    // This fixes it:
    // provider.signer.disconnect()
    // }

    return {
      chainId: provider.chainId,
      accounts: provider.accounts,
    }
  }, [provider])

  const disconnect = useCallback(() => {
    if (!provider) {
      throw new Error('provider not initialized')
    }

    provider.disconnect()
  }, [provider])

  const packed = useMemo(
    () =>
      provider
        ? {
            provider,
            connected,
            connect,
            disconnect,
            accounts,
            chainId,
          }
        : null,
    [provider, connected, accounts, chainId, connect, disconnect]
  )

  return packed
}

export default useWalletConnect
