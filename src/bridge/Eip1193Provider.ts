import { TransactionRequest } from '@ethersproject/abstract-provider'
import { Eip1193Bridge } from '@ethersproject/experimental'
import { Provider } from '@ethersproject/providers'
import { Signer } from 'ethers'

import { wrapRequestToAvatar } from './encoding'

export class Eip1193Provider extends Eip1193Bridge {
  private targetAvatar: string

  constructor(provider: Provider, signer: Signer, targetAvatar: string) {
    super(signer, provider)
    this.targetAvatar = targetAvatar
  }

  async send(method: string, params: Array<any> = []): Promise<any> {
    switch (method) {
      case 'eth_requestAccounts': {
        return [this.targetAvatar]
      }
      case 'eth_accounts': {
        return [this.targetAvatar]
      }
      case 'eth_estimateGas': {
        if (params[1] && params[1] !== 'latest') {
          throw new Error('estimateGas does not support blockTag')
        }
        const request = params[0] as TransactionRequest
        const wrappedReq = await wrapRequestToAvatar(request, this.signer)
        const result = await this.provider.estimateGas(wrappedReq)
        return result.toHexString()
      }
      case 'eth_sendTransaction': {
        if (!this.signer) {
          return new Error('eth_sendTransaction requires an account')
        }

        const request = params[0] as TransactionRequest
        const wrappedRep = await wrapRequestToAvatar(request, this.signer)
        try {
          const response = await this.signer.sendTransaction(wrappedRep)
          return response.hash
        } catch (e) {
          console.error(e)
        }
        break
      }

      default:
        return super.send(method, params)
    }
  }
}
