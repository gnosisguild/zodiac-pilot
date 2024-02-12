import { Web3Provider } from '@ethersproject/providers'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { decodeSingle, encodeMulti, encodeSingle } from 'react-multisend'

import { ChainId, MULTI_SEND_ADDRESS } from '../chains'
import {
  ForkProvider,
  useTenderlyProvider,
  WrappingProvider,
} from '../providers'
import { useConnection } from '../connections'
import { Eip1193Provider } from '../types'

import fetchAbi from './fetchAbi'
import { useDispatch, useNewTransactions } from './state'

interface Props {
  simulate: boolean
  children: ReactNode
}

const ProviderContext = createContext<Eip1193Provider | null>(null)
export const useProvider = () => useContext(ProviderContext)

const WrappingProviderContext = createContext<WrappingProvider | null>(null)
export const useWrappingProvider = () => {
  const value = useContext(WrappingProviderContext)
  if (!value) throw new Error('must be wrapped in <ProvideProvider>')
  return value
}

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
    const metaTransactions = transactions.map((txState) =>
      encodeSingle(txState.input)
    )

    if (!chainId) {
      throw new Error('chainId is undefined')
    }

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
          : encodeMulti(
              metaTransactions,
              MULTI_SEND_ADDRESS[chainId as ChainId]
            ),
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
  }, [transactions, wrappingProvider, dispatch, chainId])

  return (
    <ProviderContext.Provider
      value={simulate ? forkProvider : wrappingProvider}
    >
      <WrappingProviderContext.Provider value={wrappingProvider}>
        <SubmitTransactionsContext.Provider
          value={simulate ? submitTransactions : null}
        >
          {children}
        </SubmitTransactionsContext.Provider>
      </WrappingProviderContext.Provider>
    </ProviderContext.Provider>
  )
}

export default ProvideProvider
