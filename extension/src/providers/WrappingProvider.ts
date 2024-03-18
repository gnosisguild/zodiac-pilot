import EventEmitter from 'events'

import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { ContractFactories, KnownContracts } from '@gnosis.pm/zodiac'
import { MetaTransaction } from 'react-multisend'

import { initSafeApiKit, sendTransaction } from '../safe'
import { Connection, Eip1193Provider, TransactionData } from '../types'

const RolesV1Interface =
  ContractFactories[KnownContracts.ROLES_V1].createInterface()
const RolesV2Interface =
  ContractFactories[KnownContracts.ROLES_V2].createInterface()
const DelayInterface = ContractFactories[KnownContracts.DELAY].createInterface()

export function wrapRequest(
  request: MetaTransaction | TransactionData,
  connection: Connection,
  revertOnError = true
): TransactionData {
  if (!connection.moduleAddress) {
    throw new Error('No wrapping should be applied for direct execution')
  }

  let data: string
  switch (connection.moduleType) {
    case KnownContracts.ROLES_V1:
      data = RolesV1Interface.encodeFunctionData('execTransactionWithRole', [
        request.to || '',
        request.value || 0,
        request.data || '0x00',
        ('operation' in request && request.operation) || 0,
        connection.roleId || 0,
        revertOnError,
      ])
      break
    case KnownContracts.ROLES_V2:
      data = RolesV2Interface.encodeFunctionData('execTransactionWithRole', [
        request.to || '',
        request.value || 0,
        request.data || '0x00',
        ('operation' in request && request.operation) || 0,
        connection.roleId ||
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        revertOnError,
      ])
      break
    case KnownContracts.DELAY:
      data = DelayInterface.encodeFunctionData('execTransactionFromModule', [
        request.to || '',
        request.value || 0,
        request.data || '0x00',
        ('operation' in request && request.operation) || 0,
      ])
      break
    default:
      throw new Error(`Unsupported module type: ${connection.moduleType}`)
  }

  return {
    from: connection.pilotAddress,
    to: connection.moduleAddress,
    data: data,
    value: '0x0',
  }
}

class UnsupportedMethodError extends Error {
  code = 4200
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

class WrappingProvider extends EventEmitter {
  private connection: Connection

  private provider: Eip1193Provider
  private signer: JsonRpcSigner

  constructor(provider: Eip1193Provider, connection: Connection) {
    super()
    this.provider = provider
    this.signer = new Web3Provider(this.provider).getUncheckedSigner(
      connection.pilotAddress || ZERO_ADDRESS
    )
    this.connection = connection
  }

  async request(request: {
    method: string
    params?: Array<any>
  }): Promise<any> {
    const { method, params = [] } = request

    switch (method) {
      case 'eth_chainId': {
        const result = await this.provider.request(request)
        // WalletConnect seems to return a number even though it must be a string value
        return typeof result === 'number' ? `0x${result.toString(16)}` : result
      }

      case 'eth_requestAccounts': {
        return [this.connection.avatarAddress]
      }

      case 'eth_accounts': {
        return [this.connection.avatarAddress]
      }

      // curve.fi is unhappy without this
      case 'wallet_switchEthereumChain': {
        return true
      }

      case 'eth_estimateGas': {
        const [request, ...rest] = params

        if (!this.connection.moduleAddress) {
          // use safeTxGas estimation for direct execution
          const safeApiKit = initSafeApiKit(this.connection.chainId)
          const result = await safeApiKit.estimateSafeTransaction(
            this.connection.avatarAddress,
            request
          )
          return result.safeTxGas
        }

        const wrappedReq = wrapRequest(request, this.connection)
        try {
          const result = await this.provider.request({
            method,
            params: [wrappedReq, ...rest],
          })
          this.emit('estimateGasSuccess')
          return result
        } catch (e) {
          this.emit('estimateGasError', e, params)
          throw e
        }
      }

      case 'eth_call': {
        const [call, ...rest] = params
        return this.provider.request({
          method,
          params: [{ ...call, from: this.connection.avatarAddress }, ...rest],
        })
      }

      case 'eth_sendTransaction': {
        const [request] = params

        if (!this.connection.moduleAddress) {
          // direct execution via Safe Transaction Service
          return await sendTransaction(this.provider, this.connection, request)
        }

        const wrappedReq = wrapRequest(
          request as TransactionData,
          this.connection
        )

        return await this.signer.sendUncheckedTransaction(wrappedReq)
      }

      // Uniswap will try to use this for ERC-20 permits, but this wont fly with a contract wallet
      case 'eth_signTypedData_v4': {
        throw new UnsupportedMethodError(
          'eth_signTypedData_v4 is not supported'
        )
      }

      // not supported by Safe, but we might wanna use this once we go more generic
      // case 'eth_signTransaction': {
      //   const request = params[0] as ITxData
      //   const wrappedReq = wrapRequest(
      //     request,
      //     this.pilotAddress,
      //     this.moduleAddress
      //   )
      //   return await this.provider.connector.signTransaction(wrappedReq)
      // }

      // case 'eth_sendRawTransaction': {
      //   const safeTxHash = (await this.provider.request(request)) as string

      //   const txHash = await waitForMultisigExecution(
      //     this.provider.chainId,
      //     safeTxHash
      //   )

      //   return txHash
      // }
    }

    return await this.provider.request(request)
  }
}

export default WrappingProvider
