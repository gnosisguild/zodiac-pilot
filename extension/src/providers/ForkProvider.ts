import EventEmitter from 'events'

import { ContractFactories, KnownContracts } from '@gnosis.pm/zodiac'
import { BigNumber } from 'ethers'
import { MetaTransaction } from 'react-multisend'

import { TransactionData } from '../types'

import { GanacheProvider } from './ProvideGanache'
import { TenderlyProvider } from './ProvideTenderly'

class UnsupportedMethodError extends Error {
  code = 4200
}

interface Handlers {
  onBeforeTransactionSend(
    checkpointId: string,
    txData: TransactionData,
    isDelegateCall: boolean
  ): void
  onTransactionSent(checkpointId: string, hash: string): void
}

class ForkProvider extends EventEmitter {
  private avatarAddress: string
  private provider: TenderlyProvider | GanacheProvider
  private handlers: Handlers

  constructor(
    provider: TenderlyProvider | GanacheProvider,
    avatarAddress: string,
    handlers: Handlers
  ) {
    super()
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
          params[0] as TransactionData,
          false
        )
        const result = await this.provider.request(request)
        this.handlers.onTransactionSent(checkpointId, result)
        return result
      }
    }

    return await this.provider.request(request)
  }

  /**
   * This is a special method that is used for replaying already recorded transactions.
   * While transactions recorded from apps will generally be regular calls, the transaction translation feature allows for delegatecalls.
   * Such delegatecalls cannot be simulated directly, but only by going through the avatar.
   * @param metaTx A MetaTransaction object, can be operation: 1 (delegatecall)
   * @param avatarAddress The address of the avatar
   * @param enabledModule The address of a module enabled on the avatar that can be used to trigger a delegatecall
   */
  async sendMetaTransaction(
    metaTx: MetaTransaction,
    avatarAddress: string,
    enabledModule: string
  ): Promise<string> {
    const isDelegateCall = metaTx.operation === 1
    if (isDelegateCall && !enabledModule) {
      throw new Error('delegatecall requires an enabled module')
    }

    const checkpointId: string = await this.provider.request({
      method: 'evm_snapshot',
    })
    let tx: TransactionData
    if (isDelegateCall) {
      // delegatecalls need to go through the avatar, sent by the enabled module
      tx = {
        to: avatarAddress,
        data: execTransactionFromModule(metaTx),
        value: '0x0',
        from: enabledModule,
      }
    } else {
      // regular calls can be sent directly from the avatar
      tx = {
        to: metaTx.to,
        data: metaTx.data,
        value: formatValue(metaTx.value),
        from: avatarAddress,
      }
    }

    // take a snapshot and record the transaction
    this.handlers.onBeforeTransactionSend(checkpointId, tx, isDelegateCall)
    const result = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [tx],
    })
    this.handlers.onTransactionSent(checkpointId, result)
    return result
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

// Tenderly has particular requirements for the encoding of value: it must not have any leading zeros
const formatValue = (value: string): string => {
  const valueBN = BigNumber.from(value)
  if (valueBN.isZero()) return '0x0'
  else return valueBN.toHexString().replace(/^0x(0+)/, '0x')
}

// Encode an execTransactionFromModule call with the given meta transaction data
const execTransactionFromModule = (metaTx: MetaTransaction) => {
  // we use the DelayInterface, but any IAvatar interface would do
  const DelayInterface =
    ContractFactories[KnownContracts.DELAY].createInterface()
  return DelayInterface.encodeFunctionData('execTransactionFromModule', [
    metaTx.to || '',
    metaTx.value || 0,
    metaTx.data || '0x00',
    metaTx.operation || 0,
  ])
}
