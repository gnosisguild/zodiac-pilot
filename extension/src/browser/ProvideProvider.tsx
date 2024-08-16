import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'

import { ForkProvider } from '../providers'
import { useRoute } from '../routes'
import { Eip1193Provider } from '../types'
import { useDispatch, useNewTransactions } from '../state'
import { fetchContractInfo } from '../utils/abi'
import { ExecutionStatus } from '../state/reducer'
import { AbiCoder, BrowserProvider, id, TransactionReceipt } from 'ethers'
import {
  ConnectionType,
  execute,
  ExecutionState,
  parsePrefixedAddress,
  planExecution,
  Route as SerRoute,
} from 'ser-kit'
import { useBeforeUnload } from '../utils'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

interface Props {
  children: ReactNode
}

const ProviderContext = createContext<
  (Eip1193Provider & { getTransactionLink(txHash: string): string }) | null
>(null)
export const useProvider = () => useContext(ProviderContext)

const SubmitTransactionsContext = createContext<(() => Promise<string>) | null>(
  null
)
export const useSubmitTransactions = () => useContext(SubmitTransactionsContext)

const ProvideProvider: React.FC<Props> = ({ children }) => {
  const { provider, route, chainId } = useRoute()
  const dispatch = useDispatch()
  const transactions = useNewTransactions()

  const [, avatarAddress] = parsePrefixedAddress(route.avatar)
  const avatarWaypoint = route.waypoints?.[route.waypoints.length - 1]
  const connectionType =
    avatarWaypoint &&
    'connection' in avatarWaypoint &&
    avatarWaypoint.connection.type
  const [, connectedFrom] =
    (avatarWaypoint &&
      'connection' in avatarWaypoint &&
      parsePrefixedAddress(avatarWaypoint.connection.from)) ||
    []

  const moduleAddress =
    connectionType === ConnectionType.IS_ENABLED ? connectedFrom : undefined
  const ownerAddress =
    connectionType === ConnectionType.OWNS ? connectedFrom : undefined

  const onBeforeTransactionSend = useCallback(
    async (id: string, transaction: MetaTransactionData) => {
      // Immediately update the state with the transaction so that the UI can show it as pending.
      dispatch({
        type: 'APPEND_TRANSACTION',
        payload: { transaction, id },
      })

      // Now we can take some time decoding the transaction and we update the state once that's done.
      const contractInfo = await fetchContractInfo(
        transaction.to as `0x${string}`,
        chainId
      )
      dispatch({
        type: 'DECODE_TRANSACTION',
        payload: {
          id,
          contractInfo,
        },
      })
    },
    [chainId, dispatch]
  )

  const onTransactionSent = useCallback(
    async (
      id: string,
      snapshotId: string,
      transactionHash: string,
      provider: Eip1193Provider
    ) => {
      dispatch({
        type: 'CONFIRM_TRANSACTION',
        payload: {
          id,
          snapshotId,
          transactionHash,
        },
      })

      const receipt = await new BrowserProvider(provider).getTransactionReceipt(
        transactionHash
      )
      if (!receipt?.status) {
        dispatch({
          type: 'UPDATE_TRANSACTION_STATUS',
          payload: {
            id,
            status: ExecutionStatus.FAILED,
          },
        })
        return
      }

      if (
        receipt.logs.length === 1 &&
        isExecutionFailure(receipt.logs[0], avatarAddress, moduleAddress)
      ) {
        dispatch({
          type: 'UPDATE_TRANSACTION_STATUS',
          payload: {
            id,
            status: ExecutionStatus.META_TRANSACTION_REVERTED,
          },
        })
      } else {
        dispatch({
          type: 'UPDATE_TRANSACTION_STATUS',
          payload: {
            id,
            status: ExecutionStatus.SUCCESS,
          },
        })
      }
    },
    [dispatch, avatarAddress, moduleAddress]
  )

  const forkProviderRef = useRef<ForkProvider | null>(null)

  // whenever anything changes in the connection settings, we delete the current fork and start afresh
  useEffect(() => {
    forkProviderRef.current = new ForkProvider({
      chainId,
      avatarAddress,
      moduleAddress,
      ownerAddress,
      onBeforeTransactionSend,
      onTransactionSent,
    })
    return () => {
      forkProviderRef.current?.deleteFork()
    }
  }, [
    chainId,
    avatarAddress,
    moduleAddress,
    ownerAddress,
    onBeforeTransactionSend,
    onTransactionSent,
  ])

  // delete fork when closing browser tab (the effect teardown won't be executed in that case)
  useBeforeUnload(() => {
    forkProviderRef.current?.deleteFork()
  })

  const submitTransactions = useCallback(async () => {
    const metaTransactions = transactions.map((txState) => txState.transaction)

    console.log(
      transactions.length === 1
        ? 'submitting transaction...'
        : `submitting ${transactions.length} transactions as multi-send batch...`,
      transactions
    )

    if (!route.initiator) {
      throw new Error('Cannot execute without a connected Pilot wallet')
    }

    const plan = await planExecution(metaTransactions, route as SerRoute)
    console.log('Execution plan:', plan)

    const state = [] as ExecutionState
    await execute(plan, state, provider)

    const [batchTransactionHash] = state
    if (!batchTransactionHash) {
      throw new Error('Execution failed')
    }

    dispatch({
      type: 'SUBMIT_TRANSACTIONS',
      payload: { batchTransactionHash },
    })
    console.log(
      `multi-send batch has been submitted with transaction hash ${batchTransactionHash}`
    )
    return batchTransactionHash
  }, [transactions, provider, dispatch, route])

  if (!forkProviderRef.current) {
    return null
  }

  return (
    <ProviderContext.Provider value={forkProviderRef.current}>
      <SubmitTransactionsContext.Provider value={submitTransactions}>
        {children}
      </SubmitTransactionsContext.Provider>
    </ProviderContext.Provider>
  )
}

export default ProvideProvider

const isExecutionFailure = (
  log: TransactionReceipt['logs'][0],
  avatarAddress: string,
  moduleAddress?: string
) => {
  if (log.address.toLowerCase() !== avatarAddress.toLowerCase()) return false

  if (moduleAddress) {
    return (
      log.topics[0] === id('ExecutionFromModuleFailure(address)') &&
      log.topics[1] ===
        AbiCoder.defaultAbiCoder().encode(['address'], [moduleAddress])
    )
  } else {
    return log.topics[0] === id('ExecutionFailure(bytes32, uint256)')
  }
}
