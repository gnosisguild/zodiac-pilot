import { ITxData } from '@walletconnect/types'

import { GanacheProvider } from './ProvideGanache'
import { TenderlyProvider } from './ProvideTenderly'

class UnsupportedMethodError extends Error {
  code = 4200
}

interface Handlers {
  onTransactionSent(txData: ITxData, hash: string): void
}

class ForkProvider {
  private avatarAddress: string
  private provider: TenderlyProvider | GanacheProvider
  private handlers: Handlers

  constructor(
    provider: TenderlyProvider | GanacheProvider,
    avatarAddress: string,
    handlers: Handlers
  ) {
    this.provider = provider
    this.avatarAddress = avatarAddress
    this.handlers = handlers
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

      // Uniswap will try to use this for ERC-20 permits, but this wont fly with a contract wallet
      case 'eth_signTypedData_v4': {
        throw new UnsupportedMethodError(
          'eth_signTypedData_v4 is not supported'
        )
      }

      case 'eth_sendTransaction': {
        // record the transaction
        const result = await this.provider.request(request)
        this.handlers.onTransactionSent(params[0] as ITxData, result)
        return result
      }
    }

    return await this.provider.request(request)
  }
}

export default ForkProvider
