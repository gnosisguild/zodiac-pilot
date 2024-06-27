import { Web3Provider } from '@ethersproject/providers'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { decodeSingle, encodeMulti } from 'react-multisend'

import {
  ForkProvider,
  useTenderlyProvider,
  WrappingProvider,
} from '../providers'
import { useConnection } from '../connections'
import { Eip1193Provider } from '../types'

import { useDispatch, useNewTransactions } from '../state'
import { encodeTransaction } from '../encodeTransaction'
import { fetchContractInfo } from '../utils/abi'

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
          dispatch({
            type: 'APPEND_TRANSACTION',
            payload: { transaction, snapshotId },
          })

          // Now we can take some time decoding the transaction for real and we update the state once that's done.
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
        },
      }),
    [tenderlyProvider, connection, dispatch]
  )

  const submitTransactions = useCallback(async () => {
    const metaTransactions = transactions.map(encodeTransaction)

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
