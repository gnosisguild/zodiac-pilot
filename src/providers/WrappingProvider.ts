import EventEmitter from 'events'

import { Interface } from '@ethersproject/abi'
import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import {
  IJsonRpcResponseError,
  IJsonRpcResponseSuccess,
  ITxData,
} from '@walletconnect/types'

import rolesAbi from '../abi/Roles.json'

import { waitForMultisigExecution } from './safe'

const RolesInterface = new Interface(rolesAbi)

export function wrapRequest(
  request: ITxData,
  from: string,
  to: string,
  roleId: string
): ITxData {
  const data = RolesInterface.encodeFunctionData(
    'execTransactionWithRole(address,uint256,bytes,uint8,uint16,bool)',
    [request.to, request.value || 0, request.data, 0, roleId || 0, true]
  )

  return {
    from,
    to,
    data: data,
    value: '0x0',
  }
}

class UnsupportedMethodError extends Error {
  code = 4200
}

class WrappingProvider extends EventEmitter {
  private pilotAddress: string
  private moduleAddress: string
  private avatarAddress: string
  private roleId: string

  private provider: WalletConnectEthereumProvider

  constructor(
    provider: WalletConnectEthereumProvider,
    pilotAddress: string,
    moduleAddress: string,
    avatarAddress: string,
    roleId: string
  ) {
    super()
    this.provider = provider
    this.pilotAddress = pilotAddress
    this.moduleAddress = moduleAddress
    this.avatarAddress = avatarAddress
    this.roleId = roleId
  }

  async request(request: {
    method: string
    params?: Array<any>
  }): Promise<any> {
    const { method, params = [] } = request

    switch (method) {
      case 'eth_requestAccounts': {
        return [this.avatarAddress]
      }

      case 'eth_accounts': {
        return [this.avatarAddress]
      }

      // curve.fi is unhappy without this
      case 'wallet_switchEthereumChain': {
        return true
      }

      case 'eth_estimateGas': {
        const [request, ...rest] = params

        const wrappedReq = wrapRequest(
          request,
          this.pilotAddress,
          this.moduleAddress,
          this.roleId
        )

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
          params: [{ ...call, from: this.avatarAddress }, ...rest],
        })
      }

      case 'eth_sendTransaction': {
        const request = params[0] as ITxData
        const wrappedReq = wrapRequest(
          request,
          this.pilotAddress,
          this.moduleAddress,
          this.roleId
        )

        const safeTxHash = await this.provider.connector.sendTransaction(
          wrappedReq
        )

        const txHash = await waitForMultisigExecution(
          this.provider.chainId,
          safeTxHash
        )

        return txHash
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
