import EventEmitter from 'events'
import { hexValue } from 'ethers/lib/utils'
import {
  StaticJsonRpcProvider,
  TransactionRequest,
} from '@ethersproject/providers'
import { ChainId, RPC } from '../chains'

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
  chainId: ChainId,
  address: string
): Eip1193JsonRpcProvider => {
  const cacheKey = `${chainId}:${address.toLowerCase()}`
  if (eip1193ProviderCache.has(cacheKey)) {
    return eip1193ProviderCache.get(cacheKey)!
  }

  const provider = new Eip1193JsonRpcProvider(chainId)
  eip1193ProviderCache.set(cacheKey, provider)
  return provider
}

const hexlifyTransaction = (transaction: TransactionRequest) =>
  StaticJsonRpcProvider.hexlifyTransaction(transaction, {
    from: true,
    customData: true,
    ccipReadEnabled: true,
  })

/**
 * Based on the ethers v5 Eip1193Bridge (https://github.com/ethers-io/ethers.js/blob/v5.7/packages/experimental/src.ts/eip1193-bridge.ts)
 * Copyright (c) 2019 Richard Moore, released under MIT license.
 */
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
    let coerce = (value: any) => value

    switch (method) {
      case 'eth_gasPrice': {
        const result = await this.provider.getGasPrice()
        return result.toHexString()
      }
      case 'eth_accounts': {
        return this.address === ZERO_ADDRESS ? [] : [this.address]
      }
      case 'eth_blockNumber': {
        return await this.provider.getBlockNumber()
      }
      case 'eth_chainId': {
        return hexValue(this.chainId)
      }
      case 'eth_getBalance': {
        const result = await this.provider.getBalance(params[0], params[1])
        return result.toHexString()
      }
      case 'eth_getStorageAt': {
        return this.provider.getStorageAt(params[0], params[1], params[2])
      }
      case 'eth_getTransactionCount': {
        const result = await this.provider.getTransactionCount(
          params[0],
          params[1]
        )
        return hexValue(result)
      }
      case 'eth_getBlockTransactionCountByHash':
      case 'eth_getBlockTransactionCountByNumber': {
        const result = await this.provider.getBlock(params[0])
        return hexValue(result.transactions.length)
      }
      case 'eth_getCode': {
        const result = await this.provider.getCode(params[0], params[1])
        return result
      }
      case 'eth_sendRawTransaction': {
        return await this.provider.sendTransaction(params[0])
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

      // @TODO: Transform? No uncles?
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber': {
        if (params[1]) {
          return await this.provider.getBlockWithTransactions(params[0])
        } else {
          return await this.provider.getBlock(params[0])
        }
      }
      case 'eth_getTransactionByHash': {
        return await this.provider.getTransaction(params[0])
      }
      case 'eth_getTransactionReceipt': {
        return await this.provider.getTransactionReceipt(params[0])
      }

      case 'eth_sendTransaction':
      case 'eth_sign': {
        throw new Error(`${method} requires signing`)
      }

      case 'eth_getUncleCountByBlockHash':
      case 'eth_getUncleCountByBlockNumber': {
        coerce = hexValue
        break
      }

      case 'eth_getTransactionByBlockHashAndIndex':
      case 'eth_getTransactionByBlockNumberAndIndex':
      case 'eth_getUncleByBlockHashAndIndex':
      case 'eth_getUncleByBlockNumberAndIndex':
      case 'eth_newFilter':
      case 'eth_newBlockFilter':
      case 'eth_newPendingTransactionFilter':
      case 'eth_uninstallFilter':
      case 'eth_getFilterChanges':
      case 'eth_getFilterLogs':
      case 'eth_getLogs':
        break
    }

    // If our provider supports send, maybe it can do a better job?
    if ((<any>this.provider).send) {
      const result = this.provider.send(method, params)
      return coerce(result)
    }

    return new Error(`unsupported method: ${method}`)
  }
}
