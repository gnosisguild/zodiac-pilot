import { ITxData } from '@walletconnect/types'
import { nanoid } from 'nanoid'

import { GanacheProvider } from './ProvideGanache'
import { TenderlyProvider } from './ProvideTenderly'

class UnsupportedMethodError extends Error {
  code = 4200
}

interface Handlers {
  onBeforeTransactionSend(checkpointId: string, txData: ITxData): void
  onTransactionSent(checkpointId: string, hash: string): void
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
        // take a snapshot and record the transaction
        const checkpointId: string = await this.provider.request({
          method: 'evm_snapshot',
        })
        this.handlers.onBeforeTransactionSend(
          checkpointId,
          params[0] as ITxData
        )
        const result = await this.provider.request(request)
        this.handlers.onTransactionSent(checkpointId, result)
        return result
      }
    }

    return await this.provider.request(request)
  }

  async refork(): Promise<void> {
    if (this.provider instanceof GanacheProvider) {
      throw new Error('not currently implemented')
    }

    await this.provider.refork()
  }

  async deleteFork(): Promise<void> {
    if (this.provider instanceof GanacheProvider) {
      throw new Error('not currently implemented')
    }

    await this.provider.deleteFork()
  }
}

export default ForkProvider
