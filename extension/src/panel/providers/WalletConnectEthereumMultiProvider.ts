import { waitForMultisigExecution } from '@/safe'
import { JsonRpcError } from '@/types'
import Core from '@walletconnect/core'
import WalletConnectEthereumProvider, {
  EthereumProviderOptions,
} from '@walletconnect/ethereum-provider'
import KeyValueStorage from '@walletconnect/keyvaluestorage'
import { WalletConnectModal } from '@walletconnect/modal'
import SignClient from '@walletconnect/sign-client'
import UniversalProvider, {
  RequestArguments,
} from '@walletconnect/universal-provider'

/**
 * Extends WalletConnectEthereumProvider to add support for keeping multiple WalletConnect connections active in parallel
 **/
export class WalletConnectEthereumMultiProvider extends WalletConnectEthereumProvider {
  override readonly STORAGE_KEY: string
  readonly routeId: string

  constructor(routeId: string) {
    super()
    this.routeId = routeId
    this.STORAGE_KEY = `${routeId}:wc@2:ethereum_multi_provider`
  }

  static override async init(
    opts: EthereumProviderOptions & { routeId: string }
  ) {
    const provider = new WalletConnectEthereumMultiProvider(opts.routeId)
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
        name: this.routeId,
        core: new Core({
          ...opts,
          storage: new PrefixedKeyValueStorage(`${this.routeId}:`),
        }),
      }),
    })
    this.registerEventListeners()
    await this.loadPersistedSession()
    this.modal = modal
  }
}

export const WALLETCONNECT_PROJECT_ID = '0f8a5e2cf60430a26274b421418e8a27'

const modal = new WalletConnectModal({
  projectId: WALLETCONNECT_PROJECT_ID,
  // chains: this.rpc.chains,
  themeVariables: {
    '--wcm-z-index': '9999',
  },
})

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

function getEthereumChainId(chains: string[]): number {
  return Number(chains[0].split(':')[1])
}

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
