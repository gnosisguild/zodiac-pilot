import React, { createContext, useContext } from 'react'

import {
  Eip1193Provider,
  ForkProvider,
  useGanacheProvider,
  useWalletConnectProvider,
  WrappingProvider,
} from '../providers'

import { useDispatch } from './state'

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

  return (
    <ProviderContext.Provider
      value={simulate ? forkProvider : wrappingProvider}
    >
      {children}
    </ProviderContext.Provider>
  )
}

export default ProvideProvider
