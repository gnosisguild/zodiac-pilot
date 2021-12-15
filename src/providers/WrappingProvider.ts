import { Interface } from '@ethersproject/abi'
import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { ITxData } from '@walletconnect/types'

import { waitForMultisigExecution } from './safe'

const AvatarInterface = new Interface([
  'function execTransactionFromModule(address to, uint256 value, bytes memory data, uint8 operation) returns (bool success)',
])

export function wrapRequest(
  request: ITxData,
  from: string,
  to: string
): ITxData {
  const data = AvatarInterface.encodeFunctionData(
    'execTransactionFromModule(address,uint256,bytes,uint8)',
    [request.to, request.value || 0, request.data, 0]
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

class WrappingProvider {
  private pilotAddress: string
  private moduleAddress: string
  private avatarAddress: string

  private provider: WalletConnectEthereumProvider

  constructor(
    provider: WalletConnectEthereumProvider,
    pilotAddress: string,
    moduleAddress: string,
    avatarAddress: string
  ) {
    this.provider = provider
    this.pilotAddress = pilotAddress
    this.moduleAddress = moduleAddress
    this.avatarAddress = avatarAddress
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
        const wrappedReq = await wrapRequest(
          request,
          this.pilotAddress,
          this.moduleAddress
        )

        return await this.provider.request({
          method,
          params: [wrappedReq, ...rest],
        })
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
        const wrappedReq = await wrapRequest(
          request,
          this.pilotAddress,
          this.moduleAddress
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
      //   const wrappedReq = await wrapRequest(
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
