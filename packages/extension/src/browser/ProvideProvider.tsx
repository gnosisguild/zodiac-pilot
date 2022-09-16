import { providers } from 'ethers'
import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { decodeSingle, encodeMulti, encodeSingle } from 'react-multisend'

import { ChainId } from '../networks'
import {
  Eip1193Provider,
  ForkProvider,
  useTenderlyProvider,
  WrappingProvider,
} from '../providers'
import { useConnection } from '../settings'

import fetchAbi from './fetchAbi'
import { useDispatch, useNewTransactions } from './state'

interface Props {
  simulate: boolean
}

const ProviderContext = createContext<Eip1193Provider | null>(null)
export const useProvider = () => {
  const value = useContext(ProviderContext)
  if (!value) throw new Error('must be wrapped in <ProvideProvider>')
  return value
}

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

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const ProvideProvider: React.FC<Props> = ({ simulate, children }) => {
  const { provider: walletConnectProvider, connection } = useConnection()
  const tenderlyProvider = useTenderlyProvider()
  const pilotAddress = walletConnectProvider.accounts[0]
  const dispatch = useDispatch()
  const transactions = useNewTransactions()

  const wrappingProvider = useMemo(
    () =>
      new WrappingProvider(
        walletConnectProvider,
        pilotAddress,
        connection.moduleAddress,
        connection.avatarAddress,
        connection.roleId
      ),
    [walletConnectProvider, pilotAddress, connection]
  )

  const forkProvider = useMemo(
    () =>
      tenderlyProvider &&
      new ForkProvider(tenderlyProvider, connection.avatarAddress, {
        async onBeforeTransactionSend(txId, txData) {
          // Calling decodeSingle without a fetchAbi will return a raw transaction input object instantly.
          // We already append to the state so the UI reacts immediately.
          const inputRaw = await decodeSingle(
            {
              to: txData.to || ZERO_ADDRESS,
              value: `${txData.value || 0}`,
              data: txData.data || '',
            },
            new providers.Web3Provider(walletConnectProvider),
            undefined,
            txId
          )
          dispatch({
            type: 'APPEND_RAW_TRANSACTION',
            payload: inputRaw,
          })

          // Now we can take some time decoding the transaction for real and we update the state once that's done.
          const input = await decodeSingle(
            {
              to: txData.to || ZERO_ADDRESS,
              value: `${txData.value || 0}`,
              data: txData.data || '',
            },
            new providers.Web3Provider(walletConnectProvider),
            (address: string, data: string) =>
              fetchAbi(
                walletConnectProvider.chainId as ChainId,
                address,
                data,
                new providers.Web3Provider(walletConnectProvider)
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
    [tenderlyProvider, walletConnectProvider, connection, dispatch]
  )

  const submitTransactions = useCallback(async () => {
    console.log(
      `submitting ${transactions.length} transactions as multi-send batch...`,
      transactions
    )
    const metaTransactions = transactions.map((txState) =>
      encodeSingle(txState.input)
    )
    const batchTransactionHash = await wrappingProvider.request({
      method: 'eth_sendTransaction',
      params: [
        metaTransactions.length === 1
          ? metaTransactions[0]
          : encodeMulti(metaTransactions),
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
  }, [transactions, wrappingProvider, dispatch])

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
