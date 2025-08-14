import {
  hashMessage,
  initSafeProtocolKit,
  safeInterface,
  signMessage,
  signTypedData,
  typedDataHash,
} from '@/safe'
import type {
  Eip1193Provider,
  HexAddress,
  JsonRpcRequest,
  TransactionData,
} from '@/types'
import { decodeGenericError, getActiveTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import { ContractFactories, KnownContracts } from '@gnosis.pm/zodiac'
import { ZERO_ADDRESS } from '@zodiac/chains'
import {
  PilotSimulationMessageType,
  type SimulationMessage,
} from '@zodiac/messages'
import { addressSchema, metaTransactionRequestEqual } from '@zodiac/schema'
import { BrowserProvider, toQuantity } from 'ethers'
import EventEmitter from 'events'
import { nanoid } from 'nanoid'
import type { ChainId, MetaTransactionRequest } from 'ser-kit'
import { toHex } from 'viem'
import { rpcUrl, TenderlyProvider } from './TenderlyProvider'
import { translateSignSnapshotVote } from './translateSignSnapshotVote'

class UnsupportedMethodError extends Error {
  code = 4200
}

class Eip5792Error extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.code = code
  }
}

export type TransactionResult = {
  checkpointId: string
  hash: string
}

enum BatchStatus {
  Pending = 100,
  Confirmed = 200,
  FailedOffChain = 400,
  Reverted = 500,
  PartiallyReverted = 600,
}

/** This is separated from TenderlyProvider to provide an abstraction over Tenderly implementation details. That way we will be able to more easily plug in alternative simulation back-ends. */
export class ForkProvider extends EventEmitter {
  private provider: TenderlyProvider
  private abortController: AbortController

  private chainId: ChainId
  private avatarAddress: HexAddress
  private simulationModuleAddress: HexAddress
  private setupRequests: JsonRpcRequest[]

  private blockGasLimitPromise: Promise<bigint>
  private isSafePromise: Promise<boolean>

  private pendingMetaTransaction: Promise<TransactionResult> | undefined
  private initForkPromise: Promise<void> | undefined

  // This map is used to serve the EIP-5792 `wallet_getCallsStatus` request.
  // It maps the `id` parameter of `wallet_sendCalls` to the hashes of the resulting transactions.
  private eip5792Calls = new Map<string, `0x${string}`[]>()

  constructor({
    chainId,
    avatarAddress,
    simulationModuleAddress,
    setupRequests = [],
  }: {
    chainId: ChainId
    avatarAddress: HexAddress
    simulationModuleAddress: HexAddress
    setupRequests?: JsonRpcRequest[]
  }) {
    super()
    this.chainId = chainId
    this.provider = new TenderlyProvider(chainId)
    this.avatarAddress = avatarAddress
    this.simulationModuleAddress = simulationModuleAddress
    this.setupRequests = setupRequests
    this.abortController = new AbortController()

    this.blockGasLimitPromise = readBlockGasLimit(this.provider)

    // for now we generally assume smart accounts are Safes
    this.isSafePromise = isSmartAccount(this.avatarAddress, this.provider)

    // Usually we initialize the fork when the first transaction is sent, but if there are setup requests we rather initialize immediately.
    // This is to make sure any spoofed balances or other setup effects are visible right away.
    if (this.setupRequests.length > 0) {
      this.initForkPromise = this.initFork()
    }
  }

  private isDeleted() {
    return this.abortController.signal.aborted
  }

  private assertNotDeleted() {
    if (this.isDeleted()) {
      throw new Error('ForkProvider deleted')
    }
  }

  async request(
    request: {
      method: string
      params?: Array<any>
    },
    /** Can be used to identify the injected provider instance. */
    injectionId: string = '',
  ): Promise<any> {
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

        await this.waitForTransaction(signTx)

        console.debug('message signed', {
          messageHash: hashMessage(message),
        })

        return '0x'
      }
      case 'eth_signTypedData':
      case 'eth_signTypedData_v4': {
        const [from, dataString] = params
        if (from.toLowerCase() !== this.avatarAddress.toLowerCase()) {
          throw new Error(
            'eth_signTypedData_v4 only supported for the avatar address',
          )
        }
        const data = JSON.parse(dataString)

        const dataHash = typedDataHash(data)
        const safeMessageHash = safeInterface.encodeFunctionData(
          'getMessageHashForSafe',
          [this.avatarAddress, dataHash],
        )

        // special handling for Snapshot vote signatures
        const snapshotVoteTx = translateSignSnapshotVote(data || {})
        if (snapshotVoteTx) {
          await this.waitForTransaction(snapshotVoteTx)

          console.debug('Snapshot vote EIP-712 message signed', {
            safeMessageHash,
            typedDataHash: dataHash,
          })
        } else {
          // default EIP-712 signature handling
          const signTx = signTypedData(data)

          await this.waitForTransaction(signTx)

          console.debug('EIP-712 message signed', {
            safeMessageHash,
            typedDataHash: dataHash,
          })
        }

        return '0x'
      }

      case 'eth_sendTransaction': {
        const txData = params[0] as TransactionData

        return await this.waitForTransaction({
          to: txData.to || ZERO_ADDRESS,
          value: txData.value ? BigInt(txData.value) : 0n,
          data: txData.data || '0x',
          operation: 0,
        })
      }

      // EIP-5792 support is required for enabling Cow TWAPs
      // makes useIsTxBundlingSupported() return true (https://github.com/cowprotocol/cowswap/blob/13bd0a97550f7ec44ec86533f5b9cbfec3aa7930/libs/wallet/src/api/hooks.ts#L40)
      case 'wallet_getCapabilities': {
        return {
          [toHex(this.chainId)]: {
            atomicBatch: { supported: true },
          },
        }
      }

      // EIP-5792 batch call support is required for enabling Cow TWAPs
      case 'wallet_sendCalls': {
        const [{ calls, id = nanoid() }] = params
        const uniqueId = injectionId + '_' + id

        if (this.eip5792Calls.has(uniqueId)) {
          throw new Eip5792Error(
            `EIP-5792 call with ID ${id} already sent before`,
            5720,
          )
        }

        const txHashes = await Promise.all(
          calls.map(
            async (call: {
              to?: `0x${string}`
              data?: `0x${string}`
              value?: `0x${string}`
            }) => {
              return await this.waitForTransaction({
                to: call.to ? addressSchema.parse(call.to) : ZERO_ADDRESS,
                data: call.data || '0x',
                value: call.value ? BigInt(call.value) : 0n,
                operation: 0,
              })
            },
          ),
        )

        this.eip5792Calls.set(uniqueId, txHashes)

        return {
          id,
        }
      }

      // EIP-5792 support
      // https://docs.metamask.io/wallet/reference/json-rpc-methods/wallet_getcallsstatus/
      case 'wallet_getCallsStatus': {
        const [id] = params
        const uniqueId = injectionId + '_' + id

        const txHashes = this.eip5792Calls.get(uniqueId)
        if (!txHashes) {
          throw new Eip5792Error(`Unknown bundle id: ${id}`, 5730)
        }

        // Get transaction receipts for all transactions in the batch
        const receipts = await Promise.all(
          txHashes.map(async (hash) => {
            try {
              return await this.provider.request({
                method: 'eth_getTransactionReceipt',
                params: [hash],
              })
            } catch (error) {
              console.debug(`Failed to get receipt for ${hash}:`, error)
              return null
            }
          }),
        )

        // Determine overall status based on receipts
        const allReceiptsFound = receipts.every((receipt) => receipt !== null)
        const allSuccessful = receipts.every(
          (receipt) => receipt?.status === '0x1',
        )
        const anyFailed = receipts.some((receipt) => receipt?.status === '0x0')

        let status: BatchStatus
        if (!allReceiptsFound) {
          status = BatchStatus.Pending
        } else if (anyFailed) {
          status = BatchStatus.FailedOffChain
        } else if (allSuccessful) {
          status = BatchStatus.Confirmed
        } else {
          status = BatchStatus.Pending
        }

        return {
          id,
          status,
          receipts,
          atomic: true,
        }
      }
    }

    return await this.provider.request(request)
  }

  waitForTransaction(transaction: MetaTransactionRequest) {
    const { promise, resolve } = Promise.withResolvers<string>()

    const handleTransactionEnd = (tx: MetaTransactionRequest, hash: string) => {
      if (metaTransactionRequestEqual(tx, transaction)) {
        this.off('transactionEnd', handleTransactionEnd)

        resolve(hash)
      }
    }

    this.on('transactionEnd', handleTransactionEnd)

    this.emit('transaction', transaction)

    return promise
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
    metaTx: MetaTransactionRequest,
  ): Promise<TransactionResult> {
    // If this function is called concurrently we need to serialize the requests so we can take a snapshot in between each call

    // If there's a pending request, wait for it to finish before sending the next one
    const send = this.pendingMetaTransaction
      ? async () => {
          await this.pendingMetaTransaction
          return await this.sendMetaTransactionInSeries(metaTx)
        }
      : async () => await this.sendMetaTransactionInSeries(metaTx)

    // Synchronously update `this.pendingMetaTransaction` so subsequent `sendMetaTransaction()` calls will go to the back of the queue
    this.pendingMetaTransaction = send()

    return this.pendingMetaTransaction
  }

  private async sendMetaTransactionInSeries(
    metaTx: MetaTransactionRequest,
  ): Promise<TransactionResult> {
    await this.ensureForkInitialized()

    this.assertNotDeleted()

    const isSafe = await this.isSafePromise
    const isDelegateCall = metaTx.operation === 1

    invariant(
      isSafe || !isDelegateCall,
      'delegatecall is only supported for Safes as avatar',
    )

    this.assertNotDeleted()

    // take a snapshot and record the meta transaction
    const checkpointId: string = await this.provider.request({
      method: 'evm_snapshot',
    })
    await this.provider.request({
      method: 'evm_setNextBlockTimestamp',
      params: [Math.ceil(Date.now() / 1000).toString()],
    })

    this.assertNotDeleted()

    let tx: TransactionData
    if (isSafe) {
      // correctly route the meta tx through the avatar
      tx = execTransactionFromModule(
        metaTx,
        this.avatarAddress,
        this.simulationModuleAddress,
        await this.blockGasLimitPromise,
      )
    } else {
      // for EOA, we can just send the transaction directly
      tx = {
        to: metaTx.to,
        value: toQuantity(metaTx.value),
        data: metaTx.data || '0x',
        from: this.avatarAddress,
      }
    }

    // execute transaction in fork
    const hash = await this.provider.request({
      method: 'eth_sendTransaction',
      params: [tx],
    })

    return { checkpointId, hash }
  }

  private async ensureForkInitialized(): Promise<void> {
    // If initialization is already in progress, wait for it to complete
    if (this.initForkPromise) {
      await this.initForkPromise
      return
    }

    // Start initialization and store the promise
    this.initForkPromise = this.initFork()
    await this.initForkPromise
  }

  async initFork(): Promise<void> {
    // Check if we've been aborted before starting initialization.
    // Then check again after each async operation. This is to make sure we don't do any work if the fork is deleted.
    if (this.isDeleted()) {
      console.debug('fork deleted, skipping initialization')
      return
    }

    console.debug('Initializing fork for simulation...')
    const isSafe = await this.isSafePromise

    if (this.isDeleted()) {
      console.debug('fork deleted, skipping initialization')
      return
    }

    if (isSafe) {
      await prepareSafeForSimulation(
        {
          chainId: this.chainId,
          avatarAddress: this.avatarAddress,
          simulationModuleAddress: this.simulationModuleAddress,
        },
        this.provider,
      )
    }

    for (const request of this.setupRequests) {
      if (this.isDeleted()) {
        console.debug('fork deleted, skipping initialization')
        return
      }

      console.debug('Running setup request', request)
      await this.provider.request(translateJsonRpcRequest(request))
    }

    if (this.isDeleted()) {
      console.debug('fork deleted, skipping initialization')
      return
    }

    // notify the background script to start intercepting JSON RPC requests in the current window
    // we use the public RPC for requests originating from apps
    const activeTab = await getActiveTab()

    if (this.isDeleted()) {
      console.debug('fork deleted, skipping initialization')
      return
    }

    chrome.runtime.sendMessage<SimulationMessage>({
      type: PilotSimulationMessageType.SIMULATE_START,
      windowId: activeTab.windowId,
      chainId: this.chainId,
      rpcUrl: rpcUrl(this.provider.network, this.provider.publicRpcSlug),
      vnetId: this.provider.vnetId,
    })

    this.provider.on('update', ({ rpcUrl, vnetId }) => {
      // Check abort signal before sending update messages
      if (this.isDeleted()) {
        return
      }

      chrome.runtime.sendMessage<SimulationMessage>({
        type: PilotSimulationMessageType.SIMULATE_UPDATE,
        windowId: activeTab.windowId,
        rpcUrl,
        vnetId,
      })
    })
  }

  async deleteFork(): Promise<void> {
    // Abort any ongoing operations immediately
    this.abortController.abort('ForkProvider being deleted')

    // notify the background script to stop intercepting JSON RPC requests
    const activeTab = await getActiveTab()

    this.provider.removeAllListeners('update')

    chrome.runtime.sendMessage<SimulationMessage>({
      type: PilotSimulationMessageType.SIMULATE_STOP,
      windowId: activeTab.windowId,
    })

    await this.provider.deleteFork()
    this.eip5792Calls.clear()
    this.initForkPromise = undefined
  }

  getTransactionLink(txHash: string) {
    return this.provider.getTransactionLink(txHash)
  }
}

/** Encode an execTransactionFromModule call with the given meta transaction data */
const execTransactionFromModule = (
  metaTx: MetaTransactionRequest,
  avatarAddress: HexAddress,
  moduleAddress: HexAddress,
  blockGasLimit: bigint,
): TransactionData & { gas?: string } => {
  // we use the Delay mod interface, but any IAvatar interface would do
  const delayInterface =
    ContractFactories[KnownContracts.DELAY].createInterface()
  const data = delayInterface.encodeFunctionData('execTransactionFromModule', [
    metaTx.to || '',
    metaTx.value || 0,
    metaTx.data || '0x00',
    metaTx.operation || 0,
  ]) as HexAddress

  return {
    to: avatarAddress,
    data,
    value: toQuantity(0n),
    from: moduleAddress,
    // We simulate setting the entire block gas limit as the gas limit for the transaction
    gas: toQuantity(blockGasLimit), // Tenderly errors if the hex value has leading zeros
  }
}

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
    simulationModuleAddress,
  }: {
    chainId: ChainId
    avatarAddress: HexAddress
    simulationModuleAddress: HexAddress
  },
  provider: TenderlyProvider,
) {
  const safe = await initSafeProtocolKit(chainId, avatarAddress)

  // If we simulate as a Safe owner, we could either use execTransaction and override the threshold to 1.
  // However, enabling the owner as a module seems like a more simple approach.
  const { safeContract } = safe.getContractManager()

  invariant(safeContract != null, 'Safe contract not found')

  try {
    await provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          to: avatarAddress,
          // @ts-expect-error This apparently produces a too big union type
          data: safeContract.encode('enableModule', [simulationModuleAddress]),
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

/**
 * We don't want to expose the Tenderly API to users to keep the option open to switch to a different simulation provider in the future.
 * So rather than telling users to use tenderly_addErc20Balance, for example, we expect pilot_addErc20Balance.
 **/
const translateJsonRpcRequest = (request: JsonRpcRequest) => {
  if (request.method.startsWith('pilot_')) {
    return {
      method: 'tenderly_' + request.method.slice(6),
      params: request.params,
    }
  }
  return request
}
