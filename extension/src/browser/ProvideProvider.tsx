import { Web3Provider } from '@ethersproject/providers'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { decodeSingle, encodeMulti, encodeSingle } from 'react-multisend'

import { ChainId, EXPLORER_API_KEY, MULTI_SEND_ADDRESS } from '../networks'
import {
  ForkProvider,
  useTenderlyProvider,
  WrappingProvider,
} from '../providers'
import { useConnection } from '../settings'
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
  const { provider, connection, chainId } = useConnection()
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
      new ForkProvider(tenderlyProvider, connection.avatarAddress, {
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

          if (!chainId) {
            throw new Error('chainId is undefined')
          }

          // Now we can take some time decoding the transaction for real and we update the state once that's done.
          const input = await decodeSingle(
            metaTx,
            new Web3Provider(provider),
            (address: string, data: string) =>
              fetchAbi(
                chainId as ChainId,
                address,
                data,
                new Web3Provider(provider),
                EXPLORER_API_KEY[chainId as ChainId] || undefined
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
    [tenderlyProvider, provider, chainId, connection, dispatch]
  )

  const submitTransactions = useCallback(async () => {
    console.log(
      `submitting ${transactions.length} transactions as multi-send batch...`,
      transactions
    )
    const metaTransactions = transactions.map((txState) =>
      encodeSingle(txState.input)
    )

    if (!chainId) {
      throw new Error('chainId is undefined')
    }

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
