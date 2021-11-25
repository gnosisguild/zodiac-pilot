import { Eip1193Bridge } from '@ethersproject/experimental'
import { Provider } from '@ethersproject/providers'
import { Signer } from 'ethers'

export class Eip1193Provider extends Eip1193Bridge {
  constructor(signer: Signer, provider?: Provider) {
    super(signer, provider)
  }

  async send(method: string, params?: Array<any>): Promise<any> {
    switch (method) {
      case 'eth_requestAccounts': {
        const account = await this.signer.getAddress()
        return account
      }
      case 'net_version': {
        return '1'
      }

      default:
        return super.send(method, params)
    }
  }
}
