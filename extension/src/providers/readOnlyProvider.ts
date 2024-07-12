import EventEmitter from 'events'
import { hexValue, poll } from 'ethers/lib/utils'
import {
  StaticJsonRpcProvider,
  TransactionRequest,
} from '@ethersproject/providers'
import { RPC } from '../chains'
import { BigNumberish } from 'ethers'
import { ChainId } from 'ser-kit'

const readOnlyProviderCache = new Map<ChainId, StaticJsonRpcProvider>()
const eip1193ProviderCache = new Map<string, Eip1193JsonRpcProvider>()

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const getReadOnlyProvider = (
  chainId: ChainId
): StaticJsonRpcProvider => {
  if (readOnlyProviderCache.has(chainId)) {
    return readOnlyProviderCache.get(chainId)!
  }

  const provider = new StaticJsonRpcProvider(RPC[chainId], chainId)
  readOnlyProviderCache.set(chainId, provider)
  return provider
}

/**
 * Returns a read-only EIP-1193 provider powered by our RPC nodes. This provider is useful for reading data from the blockchain, but cannot be used to sign transactions.
 * Memoizes the provider to avoid triggering effect cascades.
 * @throws if used for wallet RPC calls
 **/
export const getEip1193ReadOnlyProvider = (
  chainId: ChainId
): Eip1193JsonRpcProvider => {
  const cacheKey = `${chainId}`
  if (eip1193ProviderCache.has(cacheKey)) {
    return eip1193ProviderCache.get(cacheKey)!
  }

  const provider = new Eip1193JsonRpcProvider(chainId)
  eip1193ProviderCache.set(cacheKey, provider)
  return provider
}

const hexlifyTransaction = ({
  gas,
  gasLimit,
  ...rest
}: TransactionRequest & { gas?: BigNumberish }) => {
  const tx = {
    ...rest,
    gasLimit: gasLimit || gas,
  }
  return StaticJsonRpcProvider.hexlifyTransaction(tx, {
    from: true,
    customData: true,
    ccipReadEnabled: true,
  })
}

export class Eip1193JsonRpcProvider extends EventEmitter {
  readonly provider: StaticJsonRpcProvider
  readonly chainId: ChainId
  readonly address: string

  constructor(chainId: ChainId, address: string = ZERO_ADDRESS) {
    super()
    this.chainId = chainId
    this.address = address
    this.provider = getReadOnlyProvider(chainId)
  }

  request(request: { method: string; params?: Array<any> }): Promise<any> {
    return this.send(request.method, request.params || [])
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
        return hexValue(this.chainId)
      }
      case 'eth_getCode': {
        const result = await this.provider.getCode(params[0], params[1])
        return result
      }
      case 'eth_getBlockByHash': {
        return poll(
          () =>
            this.provider.perform('eth_getBlock', {
              blockHash: params[0],
              includeTransactions: params[1],
            }),
          {
            oncePoll: this.provider,
          }
        )
      }
      case 'eth_getBlockByNumber': {
        return poll(
          () =>
            this.provider.perform('getBlock', {
              blockTag: params[0],
              includeTransactions: params[1],
            }),
          {
            oncePoll: this.provider,
          }
        )
      }

      case 'eth_call': {
        const req = hexlifyTransaction(params[0])
        return await this.provider.call(req, params[1])
      }

      case 'estimateGas': {
        if (params[1] && params[1] !== 'latest') {
          throw new Error('estimateGas does not support blockTag')
        }
        const req = hexlifyTransaction(params[0])
        const result = await this.provider.estimateGas(req)
        return result.toHexString()
      }

      case 'eth_sendTransaction':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
      case 'personal_sign':
      case 'eth_sign': {
        throw new Error(`${method} requires signing`)
      }

      default: {
        return this.provider.send(method, params)
      }
    }
  }
}
