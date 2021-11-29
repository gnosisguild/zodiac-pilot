import EventEmitter from 'events'

import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import { ITxData } from '@walletconnect/types'

import { wrapRequest } from './encoding'
import { waitForMultisigExecution } from './safe'

export class Eip1193Provider extends EventEmitter {
  private avatarAddress: string
  private targetAddress: string

  private provider: WalletConnectEthereumProvider

  constructor(
    provider: WalletConnectEthereumProvider,
    avatarAddress: string,
    targetAddress: string
  ) {
    super()
    this.provider = provider
    this.avatarAddress = avatarAddress
    this.targetAddress = targetAddress
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

      case 'eth_estimateGas': {
        const [request, ...rest] = params
        const wrappedReq = await wrapRequest(
          request,
          this.provider.accounts[0],
          this.targetAddress
        )

        return await this.provider.request({
          method,
          params: [wrappedReq, ...rest],
        })
      }

      // TODO: shall we impersonate the avatar for calls?
      // ^ good question, lets discuss tomorrow and maybe ask around. First hunch, I guess it wont make the difference because calls are paramterized? I.e., you don't need to impersonate to query public data?
      // case 'eth_call': {
      //   const [call, ...rest] = params
      //   return this.provider.request({
      //     method,
      //     params: [{ ...call, from: this.avatar }, ...rest],
      //   })
      // }

      case 'eth_sendTransaction': {
        const request = params[0] as ITxData
        const wrappedReq = await wrapRequest(
          request,
          this.provider.accounts[0],
          this.targetAddress
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

      case 'eth_signTransaction': {
        const request = params[0] as ITxData
        const wrappedReq = await wrapRequest(
          request,
          this.provider.accounts[0],
          this.targetAddress
        )
        return await this.provider.connector.signTransaction(wrappedReq)
      }
    }

    return await this.provider.request(request)
  }
}
