import { GanacheProvider } from './ProvideGanache'

class ForkProvider {
  private avatarAddress: string
  private provider: GanacheProvider

  constructor(provider: GanacheProvider, avatarAddress: string) {
    this.provider = provider
    this.avatarAddress = avatarAddress
  }

  async request(request: {
    method: string
    params?: Array<any>
  }): Promise<any> {
    const { method } = request

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
    }

    return await this.provider.request(request)
  }
}

export default ForkProvider
