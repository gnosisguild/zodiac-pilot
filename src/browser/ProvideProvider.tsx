import { providers } from 'ethers'
import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { encodeMulti, encodeSingle } from 'react-multisend'

import {
  Eip1193Provider,
  ForkProvider,
  useGanacheProvider,
  useWalletConnectProvider,
  WrappingProvider,
} from '../providers'

import { useDispatch, useTransactions } from './state'

interface Props {
  avatarAddress: string
  moduleAddress: string
  simulate: boolean
}

const ProviderContext = createContext<Eip1193Provider | null>(null)
export const useProvider = () => {
  const value = useContext(ProviderContext)
  if (!value) throw new Error('must be wrapped in <ProvideProvider>')
  return value
}

const CommitTransactionsContext = createContext<(() => Promise<void>) | null>(
  null
)
export const useCommitTransactions = () => useContext(CommitTransactionsContext)

const ProvideProvider: React.FC<Props> = ({
  avatarAddress,
  moduleAddress,
  simulate,
  children,
}) => {
  const { provider: walletConnectProvider } = useWalletConnectProvider()
  const ganacheProvider = useGanacheProvider()
  const pilotAddress = walletConnectProvider.accounts[0]
  const dispatch = useDispatch()
  const transactions = useTransactions()

  const wrappingProvider = useMemo(
    () =>
      new WrappingProvider(
        walletConnectProvider,
        pilotAddress,
        moduleAddress,
        avatarAddress
      ),
    [walletConnectProvider, pilotAddress, moduleAddress, avatarAddress]
  )

  const forkProvider = useMemo(
    () =>
      new ForkProvider(ganacheProvider, avatarAddress, {
        onTransactionReceived(txData, transactionHash) {
          dispatch({
            type: 'APPEND_CAPTURED_TX',
            payload: {
              to: txData.to || '0x0',
              data: txData.data || '',
              value: `${txData.value || 0}`,
              transactionHash,
            },
          })
        },
      }),
    [ganacheProvider, avatarAddress, dispatch]
  )

  const commitTransactions = useCallback(async () => {
    console.debug('commit')
    const web3Provider = new providers.Web3Provider(wrappingProvider)
    const metaTransactions = transactions.map((txState) =>
      encodeSingle(txState.input)
    )
    const txHash = await wrappingProvider.request({
      method: 'eth_sendTransaction',
      params: [
        metaTransactions.length === 1
          ? metaTransactions[0]
          : encodeMulti(metaTransactions),
      ],
    })
    console.log({ txHash })
    const receipt = await web3Provider.waitForTransaction(txHash)
    console.log({ receipt })
  }, [transactions, wrappingProvider])

  return (
    <ProviderContext.Provider
      value={simulate ? forkProvider : wrappingProvider}
    >
      <CommitTransactionsContext.Provider
        value={simulate ? commitTransactions : null}
      >
        {children}
      </CommitTransactionsContext.Provider>
    </ProviderContext.Provider>
  )
}

export default ProvideProvider
