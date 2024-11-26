import { PilotSimulationMessageType, SimulationMessage } from '@/messages'
import {
  hashMessage,
  initSafeProtocolKit,
  safeInterface,
  signMessage,
  signTypedData,
  typedDataHash,
} from '@/safe'
import { Eip1193Provider, TransactionData } from '@/types'
import { decodeGenericError, getActiveTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { ContractFactories, KnownContracts } from '@gnosis.pm/zodiac'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { BrowserProvider, toQuantity, ZeroAddress } from 'ethers'
import EventEmitter from 'events'
import { nanoid } from 'nanoid'
import { ChainId } from 'ser-kit'
import { TenderlyProvider } from './TenderlyProvider'
import { translateSignSnapshotVote } from './translateSignSnapshotVote'

class UnsupportedMethodError extends Error {
  code = 4200
}

interface Handlers {
  onBeforeTransactionSend(id: string, metaTx: MetaTransactionData): void
  onTransactionSent(
    id: string,
    checkpointId: string,
    hash: string,
    provider: Eip1193Provider
  ): void
  onTransactionError: (id: string, error: unknown) => void
}

/** This is separated from TenderlyProvider to provide an abstraction over Tenderly implementation details. That way we will be able to more easily plug in alternative simulation back-ends. */
export class ForkProvider extends EventEmitter {
  private provider: TenderlyProvider

  private chainId: ChainId
  private avatarAddress: string
  private moduleAddress: string | undefined
  private ownerAddress: string | undefined

  private handlers: Handlers

  private blockGasLimitPromise: Promise<bigint>
  private isSafePromise: Promise<boolean>

  private pendingMetaTransaction: Promise<any> | undefined
  private isInitialized = false

  constructor({
    chainId,
    avatarAddress,
    moduleAddress,
    ownerAddress,

    ...handlers
  }: {
    chainId: ChainId
    avatarAddress: string
    /** If set, will simulate transactions using respective `execTransactionFromModule` calls */
    moduleAddress?: string
    /** If set, will enable the the ownerAddress as a module and simulate using `execTransactionFromModule` calls. If neither `moduleAddress` nor `ownerAddress` is set, it will enable a dummy module 0xfacade */
    ownerAddress?: string
  } & Handlers) {
    super()
    this.chainId = chainId
    this.provider = new TenderlyProvider(chainId)
    this.avatarAddress = avatarAddress
    this.moduleAddress = moduleAddress
    this.ownerAddress = ownerAddress
    this.handlers = handlers

    this.blockGasLimitPromise = readBlockGasLimit(this.provider)

    // for now we generally assume smart accounts are Safes
    this.isSafePromise = isSmartAccount(this.avatarAddress, this.provider)
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

      case 'eth_sign': {
        throw new UnsupportedMethodError('eth_sign is not supported')
      }

      case 'personal_sign': {
        const [message, from] = params
        if (from.toLowerCase() !== this.avatarAddress.toLowerCase()) {
          throw new Error('personal_sign only supported for the avatar address')
        }
        const signTx = signMessage(message)
        const safeTxHash = await this.sendMetaTransaction(signTx)

        console.debug('message signed', {
          safeTxHash,
          messageHash: hashMessage(message),
        })

        return '0x'
      }
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        const [from, dataString] = params
        if (from.toLowerCase() !== this.avatarAddress.toLowerCase()) {
          throw new Error(
            'eth_signTypedData_v4 only supported for the avatar address'
          )
        }
        const data = JSON.parse(dataString)

        const dataHash = typedDataHash(data)
        const safeMessageHash = await safeInterface.encodeFunctionData(
          'getMessageHashForSafe',
          [this.avatarAddress, dataHash]
        )

        // special handling for Snapshot vote signatures
        const snapshotVoteTx = translateSignSnapshotVote(data || {})
        if (snapshotVoteTx) {
          const safeTxHash = await this.sendMetaTransaction(snapshotVoteTx)

          console.debug('Snapshot vote EIP-712 message signed', {
            safeTxHash,
            safeMessageHash,
            typedDataHash: dataHash,
          })
        } else {
          // default EIP-712 signature handling
          const signTx = signTypedData(data)
          const safeTxHash = await this.sendMetaTransaction(signTx)

          console.debug('EIP-712 message signed', {
            safeTxHash,
            safeMessageHash,
            typedDataHash: dataHash,
          })
        }

        return '0x'
      }

      case 'eth_sendTransaction': {
        const txData = params[0] as TransactionData
        return await this.sendMetaTransaction({
          to: txData.to || ZERO_ADDRESS,
          value: `${txData.value || 0}`,
          data: txData.data || '',
          operation: 0,
        })
      }
    }

    return await this.provider.request(request)
  }

  /**
   * While transactions recorded from EIP-1193 providers will generally be regular calls, transactions submitted through the Safe Apps SDK or resulting from transaction translations can be delegatecalls.
   * Such delegatecalls cannot be simulated directly from the avatar address, but only by going through the avatar's execution API.
   *
   * Even for regular calls (operation: 0) this method is useful to simulate the transaction through the Safe contract with the module or owner as sender (if set).
   * This is necessary to make sure the simulation succeeds for some edge cases: If a contract calls `.transfer()` on the sender's address this comes only with a 2300 gas stipend, not enough to run a cold Safe's `fallback` function.
   * This could alternatively be solved using EIP-2930 access lists, though.
   *
   * @param metaTx A MetaTransaction object, can be operation: 1 (delegatecall)
   */
  async sendMetaTransaction(
    metaTx: MetaTransactionData
  ): Promise<string | null> {
    // If this function is called concurrently we need to serialize the requests so we can take a snapshot in between each call

    const id = nanoid()
    this.handlers.onBeforeTransactionSend(id, metaTx)

    // If there's a pending request, wait for it to finish before sending the next one
    const send = this.pendingMetaTransaction
      ? async () => {
          await this.pendingMetaTransaction
          return await this.sendMetaTransactionInSeries(metaTx, id)
        }
      : async () => await this.sendMetaTransactionInSeries(metaTx, id)

    // Synchronously update `this.pendingMetaTransaction` so subsequent `sendMetaTransaction()` calls will go to the back of the queue
    this.pendingMetaTransaction = send()

    try {
      return await this.pendingMetaTransaction
    } catch (error) {
      this.handlers.onTransactionError(id, error)

      return null
    }
  }

  private async sendMetaTransactionInSeries(
    metaTx: MetaTransactionData,
    id: string
  ): Promise<string> {
    if (!this.isInitialized) {
      // we lazily initialize the fork (making the Safe ready for simulating transactions) when the first transaction is sent
      await this.initFork()
    }

    const ownerAddress =
      this.ownerAddress === ZeroAddress ? undefined : this.ownerAddress
    const isSafe = await this.isSafePromise

    invariant(
      isSafe || (this.moduleAddress == null && ownerAddress == null),
      'moduleAddress or ownerAddress is only supported for Safes as avatar'
    )

    const isDelegateCall = metaTx.operation === 1

    invariant(
      isSafe || !isDelegateCall,
      'delegatecall is only supported for Safes as avatar'
    )
    invariant(
      !isDelegateCall || this.moduleAddress != null || ownerAddress != null,
      'delegatecall requires moduleAddress or ownerAddress'
    )

    // take a snapshot and record the meta transaction
    const checkpointId: string = await this.provider.request({
      method: 'evm_snapshot',
    })
    await this.provider.request({
      method: 'evm_setNextBlockTimestamp',
      params: [Math.ceil(Date.now() / 1000).toString()],
    })

    let tx: TransactionData
    if (isSafe) {
      let from = this.moduleAddress || ownerAddress || DUMMY_MODULE_ADDRESS
      if (from === ZeroAddress) from = DUMMY_MODULE_ADDRESS

      // correctly route the meta tx through the avatar
      tx = execTransactionFromModule(
        metaTx,
        this.avatarAddress,
        from,
        await this.blockGasLimitPromise
      )
    } else {
      // for EOA, we can just send the transaction directly
      tx = {
        to: metaTx.to,
        value: toQuantity(metaTx.value || 0),
        data: metaTx.data || '0x',
        from: this.avatarAddress,
      }
    }

    // execute transaction in fork
    const hash = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [tx],
    })
    this.handlers.onTransactionSent(id, checkpointId, hash, this.provider)
    return hash
  }

  async initFork(): Promise<void> {
    console.debug('Initializing fork for simulation...')
    const isSafe = await this.isSafePromise
    if (isSafe) {
      await prepareSafeForSimulation(
        {
          chainId: this.chainId,
          avatarAddress: this.avatarAddress,
          moduleAddress: this.moduleAddress,
          ownerAddress: this.ownerAddress,
        },
        this.provider
      )
    }

    // notify the background script to start intercepting JSON RPC requests in the current window
    // we use the public RPC for requests originating from apps
    const activeTab = await getActiveTab()

    chrome.runtime.sendMessage({
      type: PilotSimulationMessageType.SIMULATE_START,
      windowId: activeTab.windowId,
      chainId: this.chainId,
      rpcUrl: this.provider.publicRpc,
    } satisfies SimulationMessage)

    this.isInitialized = true
  }

  async deleteFork(): Promise<void> {
    // notify the background script to stop intercepting JSON RPC requests
    const activeTab = await getActiveTab()

    chrome.runtime.sendMessage({
      type: PilotSimulationMessageType.SIMULATE_STOP,
      windowId: activeTab.windowId,
    } satisfies SimulationMessage)

    await this.provider.deleteFork()
    this.isInitialized = false
  }

  getTransactionLink(txHash: string) {
    return this.provider.getTransactionLink(txHash)
  }
}

/** Encode an execTransactionFromModule call with the given meta transaction data */
const execTransactionFromModule = (
  metaTx: MetaTransactionData,
  avatarAddress: string,
  moduleAddress: string,
  blockGasLimit: bigint
): TransactionData & { gas?: string } => {
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
    gas: toQuantity(blockGasLimit), // Tenderly errors if the hex value has leading zeros
    // With gas price 0 account don't need token for gas
    // gasPrice: '0x0', // doesn't seem to be required
  }
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const DUMMY_MODULE_ADDRESS = '0xfacade0000000000000000000000000000000000'

async function readBlockGasLimit(provider: Eip1193Provider) {
  const browserProvider = new BrowserProvider(provider)
  const block = await browserProvider.getBlock('latest')
  return block?.gasLimit || 30_000_000n
}

async function isSmartAccount(address: string, provider: Eip1193Provider) {
  return (
    (await provider.request({
      method: 'eth_getCode',
      params: [address, 'latest'],
    })) !== '0x'
  )
}

/**
 * Makes sure that the given Safe is ready for simulating transactions, which requires at least one module to be enabled.
 */
async function prepareSafeForSimulation(
  {
    chainId,
    avatarAddress,
    moduleAddress,
    ownerAddress,
  }: {
    chainId: ChainId
    avatarAddress: string
    moduleAddress?: string
    ownerAddress?: string
  },
  provider: TenderlyProvider
) {
  const safe = await initSafeProtocolKit(chainId, avatarAddress)

  // If we simulate as a Safe owner, we could either use execTransaction and override the threshold to 1.
  // However, enabling the owner as a module seems like a more simple approach.

  let from = moduleAddress || ownerAddress || DUMMY_MODULE_ADDRESS
  if (from === ZeroAddress) from = DUMMY_MODULE_ADDRESS

  const { safeContract } = safe.getContractManager()

  invariant(safeContract != null, 'Safe contract not found')

  try {
    await provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          to: avatarAddress,
          // @ts-expect-error TODO: needs a fix in protocol-kit -> https://github.com/safe-global/safe-core-sdk/issues/1021
          data: safeContract.encode('enableModule', [from]),
          from: avatarAddress,
        },
      ],
    })
  } catch (e) {
    // ignore revert indicating that the module is already enabled
    if (decodeGenericError(e as any) !== 'GS102') {
      throw e
    }
  }
}