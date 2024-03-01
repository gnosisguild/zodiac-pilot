import { Core } from '@walletconnect/core'
import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { WalletConnectModal } from '@walletconnect/modal'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RequestArguments } from '@walletconnect/ethereum-provider/dist/types/types'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { SignClient } from '@walletconnect/sign-client'
import { KeyValueStorage } from '@walletconnect/keyvaluestorage'
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'

import { RPC } from '../chains'
import { waitForMultisigExecution } from '../safe'
import { JsonRpcError } from '../types'

const WALLETCONNECT_PROJECT_ID = '0f8a5e2cf60430a26274b421418e8a27'

const modal = new WalletConnectModal({
  projectId: WALLETCONNECT_PROJECT_ID,
  // chains: this.rpc.chains,
  themeVariables: {
    '--wcm-z-index': '9999',
  },
})

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
      const txHash = await waitForMultisigExecution(this.chainId, safeTxHash)
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
          storage: new PrefixedKeyValueStorage(`${this.connectionId}:`),
        }),
      }),
    })
    this.registerEventListeners()
    await this.loadPersistedSession()
    this.modal = modal
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

export interface WalletConnectResult {
  provider: WalletConnectEthereumMultiProvider
  connected: boolean
  connect(): Promise<{ chainId: number; accounts: string[] }>
  disconnect(): void
  accounts: string[]
  chainId?: number
}

const useWalletConnect = (connectionId: string): WalletConnectResult | null => {
  const [provider, setProvider] =
    useState<WalletConnectEthereumMultiProvider | null>(null)
  const [connected, setConnected] = useState(
    provider ? provider.connected : false
  )
  const [accounts, setAccounts] = useState(provider ? provider.accounts : [])
  const [chainId, setChainId] = useState<number | undefined>()

  // effect to initialize the provider
  useEffect(() => {
    if (!providers[connectionId]) {
      providers[connectionId] = WalletConnectEthereumMultiProvider.init({
        connectionId,
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        chains: [] as any, // recommended by WalletConnect for multi-chain apps (but somehow their typings don't allow it)
        optionalChains: Object.keys(RPC).map((chainId) => Number(chainId)),
        rpcMap: RPC,
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

    // disable warning about too many listeners
    provider.events.setMaxListeners(0)

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

    // at this point provider.chainId is generally 1, we gotta wait for the chainChanged event which will be emitted even if the final chainId continues to be 1
    await new Promise((resolve) =>
      provider.events.once('chainChanged', () => resolve(provider.chainId))
    )

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

/** Adjusted from https://github.com/WalletConnect/walletconnect-utils/blob/master/misc/keyvaluestorage/src/browser/index.ts */
class PrefixedKeyValueStorage extends KeyValueStorage {
  private readonly prefix: string

  constructor(prefix: string) {
    super()
    this.prefix = prefix
  }

  public async getItem<T = any>(key: string): Promise<T | undefined> {
    return super.getItem(this.prefix + key)
  }

  public async setItem<T = any>(key: string, value: T): Promise<void> {
    super.setItem(this.prefix + key, value)
  }

  public async removeItem(key: string): Promise<void> {
    super.removeItem(this.prefix + key)
  }
}

function getEthereumChainId(chains: string[]): number {
  return Number(chains[0].split(':')[1])
}
