import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { encodeMulti } from 'ethers-multisend'

import {
  ForkProvider,
  useTenderlyProvider,
  WrappingProvider,
} from '../providers'
import { useConnection } from '../connections'
import { Connection, Eip1193Provider } from '../types'
import { useDispatch, useNewTransactions } from '../state'
import { fetchContractInfo } from '../utils/abi'
import { TransactionReceipt, Web3Provider } from '@ethersproject/providers'
import { ExecutionStatus } from '../state/reducer'
import { defaultAbiCoder } from '@ethersproject/abi'

interface Props {
  simulate: boolean
  children: ReactNode
}

const ProviderContext = createContext<Eip1193Provider | null>(null)
export const useProvider = () => useContext(ProviderContext)

const SubmitTransactionsContext = createContext<(() => Promise<string>) | null>(
  null
)
export const useSubmitTransactions = () => useContext(SubmitTransactionsContext)

const ProvideProvider: React.FC<Props> = ({ simulate, children }) => {
  const { provider, connection } = useConnection()
  const tenderlyProvider = useTenderlyProvider()
  const dispatch = useDispatch()
  const transactions = useNewTransactions()

  const wrappingProvider = useMemo(
    () => new WrappingProvider(provider, connection),
    [provider, connection]
  )

  const forkProvider = useMemo(
    () =>
      tenderlyProvider &&
      new ForkProvider(tenderlyProvider, {
        avatarAddress: connection.avatarAddress,
        moduleAddress: connection.moduleAddress,
        ownerAddress: connection.pilotAddress,

        async onBeforeTransactionSend(snapshotId, transaction) {
          // Immediately update the state with the transaction so that the UI can show it as pending.
          dispatch({
            type: 'APPEND_TRANSACTION',
            payload: { transaction, snapshotId },
          })

          // Now we can take some time decoding the transaction and we update the state once that's done.
          const contractInfo = await fetchContractInfo(
            transaction.to as `0x${string}`,
            connection.chainId
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

          const receipt = await new Web3Provider(
            tenderlyProvider
          ).getTransactionReceipt(transactionHash)
          if (!receipt.status) {
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
            isExecutionFromModuleFailure(receipt.logs[0], connection)
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
    [tenderlyProvider, connection, dispatch]
  )

  const submitTransactions = useCallback(async () => {
    const metaTransactions = transactions.map((txState) => txState.transaction)

    console.log(
      transactions.length === 1
        ? 'submitting transaction...'
        : `submitting ${transactions.length} transactions as multi-send batch...`,
      transactions
    )

    const batchTransactionHash = await wrappingProvider.request({
      method: 'eth_sendTransaction',
      params: [
        metaTransactions.length === 1
          ? metaTransactions[0]
          : encodeMulti(metaTransactions, connection.multisend),
      ],
    })
    dispatch({
      type: 'SUBMIT_TRANSACTIONS',
      payload: { batchTransactionHash },
    })
    console.log(
      `multi-send batch has been submitted with transaction hash ${batchTransactionHash}`
    )
    return batchTransactionHash
  }, [transactions, wrappingProvider, dispatch, connection.multisend])

  return (
    <ProviderContext.Provider
      value={simulate ? forkProvider : wrappingProvider}
    >
      <SubmitTransactionsContext.Provider
        value={simulate ? submitTransactions : null}
      >
        {children}
      </SubmitTransactionsContext.Provider>
    </ProviderContext.Provider>
  )
}

export default ProvideProvider

const isExecutionFromModuleFailure = (
  log: TransactionReceipt['logs'][0],
  connection: Connection
) => {
  return (
    log.address.toLowerCase() === connection.avatarAddress.toLowerCase() &&
    log.topics[0] ===
      '0xacd2c8702804128fdb0db2bb49f6d127dd0181c13fd45dbfe16de0930e2bd375' && // ExecutionFromModuleFailure(address)
    log.topics[1] ===
      defaultAbiCoder.encode(['address'], [connection.moduleAddress])
  )
}
