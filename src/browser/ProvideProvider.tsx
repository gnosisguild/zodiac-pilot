import { providers } from 'ethers'
import { provider } from 'ganache'
import React, { createContext, useContext } from 'react'
import { encodeSingle } from 'react-multisend'

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

  const wrappingProvider = new WrappingProvider(
    walletConnectProvider,
    pilotAddress,
    moduleAddress,
    avatarAddress
  )

  const forkProvider = new ForkProvider(ganacheProvider, avatarAddress, {
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
  })

  const web3Provider = new providers.Web3Provider(wrappingProvider)
  const commitTransactions = async () => {
    const inputs = transactions.map((txState) => txState.input)
    if (inputs.length === 1) {
      const txHash = await wrappingProvider.request({
        method: 'eth_sendTransaction',
        params: [encodeSingle(inputs[0])],
      })
      console.log({ txHash })
      const receipt = await web3Provider.waitForTransaction(txHash)
      console.log({ receipt })
    }
  }

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
