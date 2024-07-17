import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'

import { ForkProvider, useTenderlyProvider } from '../providers'
import { useRoute } from '../routes'
import { Eip1193Provider } from '../types'
import { useDispatch, useNewTransactions } from '../state'
import { fetchContractInfo } from '../utils/abi'
import { ExecutionStatus } from '../state/reducer'
import { AbiCoder, BrowserProvider, TransactionReceipt } from 'ethers'
import {
  ConnectionType,
  execute,
  ExecutionActionType,
  ExecutionState,
  parsePrefixedAddress,
  planExecution,
  Route as SerRoute,
} from 'ser-kit'

interface Props {
  children: ReactNode
}

const ProviderContext = createContext<Eip1193Provider | null>(null)
export const useProvider = () => useContext(ProviderContext)

const SubmitTransactionsContext = createContext<(() => Promise<string>) | null>(
  null
)
export const useSubmitTransactions = () => useContext(SubmitTransactionsContext)

const ProvideProvider: React.FC<Props> = ({ children }) => {
  const { provider, route, chainId } = useRoute()
  const tenderlyProvider = useTenderlyProvider()
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

  const forkProvider = useMemo(
    () =>
      tenderlyProvider &&
      new ForkProvider(tenderlyProvider, {
        avatarAddress,
        moduleAddress:
          connectionType === ConnectionType.IS_ENABLED
            ? connectedFrom
            : undefined,
        ownerAddress:
          connectionType === ConnectionType.OWNS ? connectedFrom : undefined,

        async onBeforeTransactionSend(snapshotId, transaction) {
          // Immediately update the state with the transaction so that the UI can show it as pending.
          dispatch({
            type: 'APPEND_TRANSACTION',
            payload: { transaction, snapshotId },
          })

          // Now we can take some time decoding the transaction and we update the state once that's done.
          const contractInfo = await fetchContractInfo(
            transaction.to as `0x${string}`,
            chainId
          )
          dispatch({
            type: 'DECODE_TRANSACTION',
            payload: {
              snapshotId,
              contractInfo,
            },
          })
        },

        async onTransactionSent(snapshotId, transactionHash) {
          dispatch({
            type: 'CONFIRM_TRANSACTION',
            payload: {
              snapshotId,
              transactionHash,
            },
          })

          const receipt = await new BrowserProvider(
            tenderlyProvider
          ).getTransactionReceipt(transactionHash)
          if (!receipt?.status) {
            dispatch({
              type: 'UPDATE_TRANSACTION_STATUS',
              payload: {
                snapshotId,
                status: ExecutionStatus.REVERTED,
              },
            })
            return
          }

          if (
            receipt.logs.length === 1 &&
            connectionType === ConnectionType.IS_ENABLED &&
            isExecutionFromModuleFailure(
              receipt.logs[0],
              avatarAddress,
              connectedFrom
            )
          ) {
            dispatch({
              type: 'UPDATE_TRANSACTION_STATUS',
              payload: {
                snapshotId,
                status: ExecutionStatus.MODULE_TRANSACTION_REVERTED,
              },
            })
          } else {
            dispatch({
              type: 'UPDATE_TRANSACTION_STATUS',
              payload: {
                snapshotId,
                status: ExecutionStatus.SUCCESS,
              },
            })
          }
        },
      }),
    [
      tenderlyProvider,
      avatarAddress,
      connectionType,
      connectedFrom,
      chainId,
      dispatch,
    ]
  )

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

    if (plan.length > 1) {
      throw new Error('Multi-step execution not yet supported')
    }

    if (plan[0]?.type !== ExecutionActionType.EXECUTE_TRANSACTION) {
      throw new Error('Only transaction execution is currently supported')
    }

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

  return (
    <ProviderContext.Provider value={forkProvider}>
      <SubmitTransactionsContext.Provider value={submitTransactions}>
        {children}
      </SubmitTransactionsContext.Provider>
    </ProviderContext.Provider>
  )
}

export default ProvideProvider

const isExecutionFromModuleFailure = (
  log: TransactionReceipt['logs'][0],
  avatarAddress: string,
  moduleAddress?: string
) => {
  return (
    log.address.toLowerCase() === avatarAddress.toLowerCase() &&
    log.topics[0] ===
      '0xacd2c8702804128fdb0db2bb49f6d127dd0181c13fd45dbfe16de0930e2bd375' && // ExecutionFromModuleFailure(address)
    (!moduleAddress ||
      log.topics[1] ===
        AbiCoder.defaultAbiCoder().encode(['address'], [moduleAddress]))
  )
}
