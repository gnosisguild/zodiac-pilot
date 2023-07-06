import { safeJsonParse, safeJsonStringify } from '@walletconnect/safe-json'
import { Core } from '@walletconnect/core'
import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RequestArguments } from '@walletconnect/ethereum-provider/dist/types/types'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { SignClient } from '@walletconnect/sign-client'
import { IKeyValueStorage, parseEntry } from '@walletconnect/keyvaluestorage'
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'

import { RPC } from '../networks'
import { waitForMultisigExecution } from '../safe'
import { JsonRpcError } from '../types'

/**
 * Extends WalletConnectEthereumProvider to add support for keeping multiple WalletConnect connections active in parallel
 **/
class WalletConnectEthereumMultiProvider extends WalletConnectEthereumProvider {
  override readonly STORAGE_KEY: string
  readonly connectionId: string

  constructor(connectionId: string) {
    super()
    this.connectionId = connectionId
    this.STORAGE_KEY = `${connectionId}:wc@2:ethereum_multi_provider`
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

  protected override async initialize(opts: EthereumProviderOptions) {
    this.rpc = this.getRpcConfig(opts)
    this.chainId = this.rpc.chains.length
      ? getEthereumChainId(this.rpc.chains)
      : getEthereumChainId(this.rpc.optionalChains || [])
    this.signer = await UniversalProvider.init({
      projectId: this.rpc.projectId,
      metadata: this.rpc.metadata,
      disableProviderPing: opts.disableProviderPing,
      relayUrl: opts.relayUrl,
      storageOptions: opts.storageOptions,
      client: await SignClient.init({
        logger: 'error',
        relayUrl: opts.relayUrl || 'wss://relay.walletconnect.com',
        projectId: this.rpc.projectId,
        metadata: this.rpc.metadata,
        storageOptions: opts.storageOptions,
        name: this.connectionId,
        core: new Core({
          ...opts,
          storage: new PrefixedLocalStorage(`${this.connectionId}:`),
        }),
      }),
    })
    this.registerEventListeners()
    await this.loadPersistedSession()
    if (this.rpc.showQrModal) {
      let WalletConnectModalClass
      try {
        const { WalletConnectModal } = await import('@walletconnect/modal')
        WalletConnectModalClass = WalletConnectModal
      } catch {
        throw new Error(
          'To use QR modal, please install @walletconnect/modal package'
        )
      }
      if (WalletConnectModalClass) {
        try {
          this.modal = new WalletConnectModalClass({
            projectId: this.rpc.projectId,
            chains: this.rpc.chains,
            ...this.rpc.qrModalOptions,
          })
        } catch (e) {
          this.signer.logger.error(e)
          throw new Error('Could not generate WalletConnectModal Instance')
        }
      }
    }
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

    await provider.disconnect()
    await provider.enable()

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

class PrefixedLocalStorage implements IKeyValueStorage {
  private readonly localStorage: Storage = localStorage
  private readonly prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  public async getKeys(): Promise<string[]> {
    return Object.keys(this.localStorage)
  }

  public async getEntries<T = any>(): Promise<[string, T][]> {
    return Object.entries(this.localStorage).map(parseEntry)
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    const item = this.localStorage.getItem(this.prefix + key)
    if (item === null) {
      return undefined
    }
    // TODO: fix this annoying type casting
    return safeJsonParse(item) as T
  }

  public async setItem<T = any>(key: string, value: T): Promise<void> {
    this.localStorage.setItem(this.prefix + key, safeJsonStringify(value))
  }

  public async removeItem(key: string): Promise<void> {
    this.localStorage.removeItem(this.prefix + key)
  }
}

function getEthereumChainId(chains: string[]): number {
  return Number(chains[0].split(':')[1])
}
