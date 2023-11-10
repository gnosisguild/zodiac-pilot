import EventEmitter from 'events'

import { ContractFactories, KnownContracts } from '@gnosis.pm/zodiac'
import { BigNumber, ethers } from 'ethers'
import { MetaTransaction } from 'react-multisend'
import { TransactionOptions } from '@safe-global/safe-core-sdk-types'
import { generatePreValidatedSignature } from '@safe-global/protocol-kit/dist/src/utils'

import { Eip1193Provider, TransactionData } from '../types'
import { TenderlyProvider } from './ProvideTenderly'
import { safeInterface } from '../safe'
import { hexlify } from 'ethers/lib/utils'

class UnsupportedMethodError extends Error {
  code = 4200
}

interface Handlers {
  onBeforeTransactionSend(checkpointId: string, metaTx: MetaTransaction): void
  onTransactionSent(checkpointId: string, hash: string): void
}

class ForkProvider extends EventEmitter {
  private provider: TenderlyProvider
  private handlers: Handlers
  private avatarAddress: string

  private moduleAddress: string | undefined
  private ownerAddress: string | undefined

  private blockGasLimitPromise: Promise<number>

  constructor(
    provider: TenderlyProvider,
    {
      avatarAddress,
      moduleAddress,
      ownerAddress,

      ...handlers
    }: {
      avatarAddress: string
      /** If set, will simulate the transaction though an `execTransactionFromModule` call */
      moduleAddress?: string
      /** If set, will simulate the transaction though an `execTransaction` call */
      ownerAddress?: string
    } & Handlers
  ) {
    super()
    this.provider = provider
    this.avatarAddress = avatarAddress
    this.moduleAddress = moduleAddress
    this.ownerAddress = ownerAddress
    this.handlers = handlers

    this.blockGasLimitPromise = readBlockGasLimit(this.provider)
  }

  async request(request: {
    method: string
    params?: Array<any>
  }): Promise<any> {
    const { method, params = [] } = request

    switch (method) {
      case 'eth_chainId': {
        const result = await this.provider.request(request)
        // WalletConnect seems to return a number even though it must be a string value
        return typeof result === 'number' ? `0x${result.toString(16)}` : result
      }

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

      // Uniswap will try to use this for ERC-20 permits, but we prefer to do a regular approval as part of the batch
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

        const txData = params[0] as TransactionData
        const metaTx: MetaTransaction = {
          to: txData.to || ZERO_ADDRESS,
          value: `${txData.value || 0}`,
          data: txData.data || '',
          operation: 0,
        }
        this.handlers.onBeforeTransactionSend(checkpointId, metaTx)

        // Instead of simulating with the avatar as sender, we simulate going through the Safe contract with the module or owner as sender (if set).
        // This is necessary to make sure the simulation succeeds for some edge cases: If a contract calls `.transfer()` on the sender's address this comes only with a 2300 gas stipend, not enough to run a cold Safe's `fallback` function.
        let finalRequest = request
        if (this.moduleAddress) {
          finalRequest = {
            method,
            params: [
              execTransactionFromModule(
                metaTx,
                this.avatarAddress,
                this.moduleAddress,
                await this.blockGasLimitPromise
              ),
            ],
          }
        } else if (this.ownerAddress) {
          finalRequest = {
            method,
            params: [
              execTransaction(
                metaTx,
                this.avatarAddress,
                this.ownerAddress,
                await this.blockGasLimitPromise
              ),
            ],
          }
        }
        const result = await this.provider.request(finalRequest)

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
   */
  async sendMetaTransaction(metaTx: MetaTransaction): Promise<string> {
    const isDelegateCall = metaTx.operation === 1
    if (isDelegateCall && !this.moduleAddress && !this.ownerAddress) {
      throw new Error('delegatecall requires moduleAddress or ownerAddress')
    }

    // take a snapshot and record the meta transaction
    const checkpointId: string = await this.provider.request({
      method: 'evm_snapshot',
    })
    this.handlers.onBeforeTransactionSend(checkpointId, metaTx)

    // correctly route the meta tx through the avatar
    let tx: TransactionData
    if (this.moduleAddress) {
      tx = execTransactionFromModule(
        metaTx,
        this.avatarAddress,
        this.moduleAddress,
        await this.blockGasLimitPromise
      )
    } else if (this.ownerAddress) {
      tx = execTransactionFromModule(
        metaTx,
        this.avatarAddress,
        this.ownerAddress,
        await this.blockGasLimitPromise
      )
    } else {
      // regular calls can be sent directly from the avatar
      tx = {
        to: metaTx.to,
        data: metaTx.data,
        value: formatValue(metaTx.value),
        from: this.avatarAddress,
      }
    }

    // execute transaction in fork
    const result = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [tx],
    })
    this.handlers.onTransactionSent(checkpointId, result)
    return result
  }

  async refork(): Promise<void> {
    await this.provider.refork()
  }

  async deleteFork(): Promise<void> {
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

/** Encode an execTransactionFromModule call with the given meta transaction data */
const execTransactionFromModule = (
  metaTx: MetaTransaction,
  avatarAddress: string,
  moduleAddress: string,
  blockGasLimit: number
): TransactionData & TransactionOptions => {
  // we use the Delay mod interface, but any IAvatar interface would do
  const delayInterface =
    ContractFactories[KnownContracts.DELAY].createInterface()
  const data = delayInterface.encodeFunctionData('execTransactionFromModule', [
    metaTx.to || '',
    metaTx.value || 0,
    metaTx.data || '0x00',
    metaTx.operation || 0,
  ])

  return {
    to: avatarAddress,
    data,
    value: '0x0',
    from: moduleAddress,
    // We simulate setting the entire block gas limit as the gas limit for the transaction
    gasLimit: hexlify(blockGasLimit),
    // With gas price 0 account don't need token for gas
    gasPrice: '0x0',
  }
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/** Encode an execTransaction call by the given owner (address must be an actual owner of the Safe) */
// for reference: https://github.com/safe-global/safe-wallet-web/blob/dev/src/components/tx/security/tenderly/utils.ts#L213
export function execTransaction(
  tx: MetaTransaction & TransactionOptions,
  avatarAddress: string,
  ownerAddress: string,
  blockGasLimit: number
): TransactionData & TransactionOptions {
  const signature = generatePreValidatedSignature(ownerAddress)
  const data = safeInterface.encodeFunctionData('execTransaction', [
    tx.to,
    tx.value,
    tx.data,
    tx.operation,
    tx.gasLimit || tx.gas || 0,
    0,
    tx.gasPrice || 0,
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    signature.staticPart() + signature.dynamicPart(),
  ])

  return {
    to: avatarAddress,
    data,
    value: '0x0',
    from: ownerAddress,
    // We simulate setting the entire block gas limit as the gas limit for the transaction
    gasLimit: hexlify(blockGasLimit),
    // With gas price 0 account don't need token for gas
    gasPrice: '0x0',
  }
}

const readBlockGasLimit = async (
  provider: Eip1193Provider
): Promise<number> => {
  const web3Provider = new ethers.providers.Web3Provider(provider)
  const block = await web3Provider.getBlock('latest')
  return block.gasLimit.toNumber()
}
