import { GanacheProvider } from './ProvideGanache'

class UnsupportedMethodError extends Error {
  code = 4200
}

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

      // Uniswap will try to use this for ERC-20 permits, but this wont fly with a contract wallet
      case 'eth_signTypedData_v4': {
        throw new UnsupportedMethodError(
          'eth_signTypedData_v4 is not supported'
        )
      }
    }

    return await this.provider.request(request)
  }
}

export default ForkProvider
