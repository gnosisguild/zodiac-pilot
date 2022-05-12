import { providers } from 'ethers'
import { nanoid } from 'nanoid'
import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { decodeSingle, encodeMulti, encodeSingle } from 'react-multisend'

import {
  Eip1193Provider,
  ForkProvider,
  useGanacheProvider,
  WrappingProvider,
} from '../providers'
import { useConnection } from '../settings'

import fetchAbi, { NetworkId } from './fetchAbi'
import { useDispatch, useTransactions } from './state'

interface Props {
  avatarAddress: string
  moduleAddress: string
  roleId: string
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

const CommitTransactionsContext = createContext<(() => Promise<void>) | null>(
  null
)
export const useCommitTransactions = () => useContext(CommitTransactionsContext)

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const ProvideProvider: React.FC<Props> = ({
  avatarAddress,
  moduleAddress,
  roleId,
  simulate,
  children,
}) => {
  const { provider: walletConnectProvider } = useConnection()
  // const ganacheProvider = useGanacheProvider()
  const ganacheProvider = null
  const pilotAddress = walletConnectProvider.accounts[0]
  const dispatch = useDispatch()
  const transactions = useTransactions()

  const wrappingProvider = useMemo(
    () =>
      new WrappingProvider(
        walletConnectProvider,
        pilotAddress,
        moduleAddress,
        avatarAddress,
        roleId
      ),
    [walletConnectProvider, pilotAddress, moduleAddress, avatarAddress, roleId]
  )

  const forkProvider = useMemo(
    () =>
      ganacheProvider &&
      new ForkProvider(ganacheProvider, avatarAddress, {
        async onTransactionReceived(txData, transactionHash) {
          const input = await decodeSingle(
            {
              to: txData.to || ZERO_ADDRESS,
              value: `${txData.value || 0}`,
              data: txData.data || '',
            },
            new providers.Web3Provider(walletConnectProvider),
            (address: string) =>
              fetchAbi(
                walletConnectProvider.chainId as NetworkId,
                address,
                new providers.Web3Provider(walletConnectProvider)
              ),
            nanoid()
          )
          dispatch({
            type: 'APPEND_CAPTURED_TX',
            payload: {
              input,
              transactionHash,
            },
          })
        },
      }),
    [ganacheProvider, walletConnectProvider, avatarAddress, dispatch]
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
      <WrappingProviderContext.Provider value={wrappingProvider}>
        <CommitTransactionsContext.Provider
          value={simulate ? commitTransactions : null}
        >
          {children}
        </CommitTransactionsContext.Provider>
      </WrappingProviderContext.Provider>
    </ProviderContext.Provider>
  )
}

export default ProvideProvider
