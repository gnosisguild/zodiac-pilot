import type { JsonRpcRequest } from '@/types'
import { RPC } from '@zodiac/chains'
import { JsonRpcProvider, toQuantity } from 'ethers'
import EventEmitter from 'events'
import type { ChainId } from 'ser-kit'

const readOnlyProviderCache = new Map<ChainId, JsonRpcProvider>()
const eip1193ProviderCache = new Map<string, Eip1193JsonRpcProvider>()

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const getReadOnlyProvider = (chainId: ChainId): JsonRpcProvider => {
  if (readOnlyProviderCache.has(chainId)) {
    return readOnlyProviderCache.get(chainId)!
  }

  const provider = new JsonRpcProvider(RPC[chainId].toString(), chainId, {
    staticNetwork: true,
  })
  readOnlyProviderCache.set(chainId, provider)
  return provider
}

/**
 * Returns a read-only EIP-1193 provider powered by our RPC nodes. This provider is useful for reading data from the blockchain, but cannot be used to sign transactions.
 * Memoizes the provider to avoid triggering effect cascades.
 * @throws if used for wallet RPC calls
 **/
export const getEip1193ReadOnlyProvider = (
  chainId: ChainId,
): Eip1193JsonRpcProvider => {
  const cacheKey = `${chainId}`
  if (eip1193ProviderCache.has(cacheKey)) {
    return eip1193ProviderCache.get(cacheKey)!
  }

  const provider = new Eip1193JsonRpcProvider(chainId)
  eip1193ProviderCache.set(cacheKey, provider)
  return provider
}

export class Eip1193JsonRpcProvider extends EventEmitter {
  readonly provider: JsonRpcProvider
  readonly chainId: ChainId
  readonly address: string

  constructor(chainId: ChainId, address: string = ZERO_ADDRESS) {
    super()
    this.chainId = chainId
    this.address = address
    this.provider = getReadOnlyProvider(chainId)
  }

  request(request: JsonRpcRequest): Promise<any> {
    return this.send(
      request.method,
      !request.params || Array.isArray(request.params)
        ? request.params
        : [request.params],
    )
  }

  async send(method: string, params: any[] = []): Promise<any> {
    switch (method) {
      case 'eth_accounts': {
        return !this.address || this.address === ZERO_ADDRESS
          ? []
          : [this.address]
      }
      case 'eth_blockNumber': {
        return await this.provider.getBlockNumber()
      }
      case 'eth_chainId': {
        return toQuantity(this.chainId)
      }
      case 'eth_getCode': {
        const result = await this.provider.getCode(params[0], params[1])
        return result
      }
      case 'eth_getBlockByHash': {
        return this.provider.send('eth_getBlock', {
          blockHash: params[0],
          includeTransactions: params[1],
        })
      }
      case 'eth_getBlockByNumber': {
        return this.provider.send('getBlock', {
          blockTag: params[0],
          includeTransactions: params[1],
        })
      }

      case 'eth_call': {
        return await this.provider.call(params[0])
      }

      case 'estimateGas': {
        if (params[1] && params[1] !== 'latest') {
          throw new Error('estimateGas does not support blockTag')
        }
        const result = await this.provider.estimateGas(params[0])
        return toQuantity(result)
      }

      case 'eth_requestAccounts':
      case 'eth_sendTransaction':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
      case 'personal_sign':
      case 'eth_sign': {
        throw new Error(`${method} not supported by read-only provider`)
      }

      default: {
        return this.provider.send(method, params)
      }
    }
  }
}
