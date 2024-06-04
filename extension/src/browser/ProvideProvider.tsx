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

import fetchAbi from './fetchAbi'
import { useDispatch, useNewTransactions } from '../state'
import { encodeTransaction } from '../encodeTransaction'

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

        async onBeforeTransactionSend(txId, metaTx) {
          const isDelegateCall = metaTx.operation === 1

          // Calling decodeSingle without a fetchAbi will return a raw transaction input object instantly.
          // We already append to the state so the UI reacts immediately.
          const inputRaw = await decodeSingle(
            metaTx,
            new Web3Provider(provider),
            undefined,
            txId
          )
          dispatch({
            type: 'APPEND_RAW_TRANSACTION',
            payload: { input: inputRaw, isDelegateCall },
          })

          // Now we can take some time decoding the transaction for real and we update the state once that's done.
          const input = await decodeSingle(
            metaTx,
            new Web3Provider(provider),
            (address: string, data: string) =>
              fetchAbi(
                connection.chainId,
                address,
                data,
                new Web3Provider(provider)
              ),
            txId
          )
          dispatch({
            type: 'DECODE_TRANSACTION',
            payload: input,
          })
        },

        async onTransactionSent(txId, transactionHash) {
          dispatch({
            type: 'CONFIRM_TRANSACTION',
            payload: {
              id: txId,
              transactionHash,
            },
          })
        },
      }),
    [tenderlyProvider, provider, connection, dispatch]
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
  }, [transactions, wrappingProvider, dispatch, connection.chainId])

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
