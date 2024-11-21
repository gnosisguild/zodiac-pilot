import { invariant } from '@epic-web/invariant'
import { createContext, PropsWithChildren, useContext } from 'react'
import { ChainId } from 'ser-kit'
import { Eip1193Provider } from '../../types'
import {
  ConnectFn,
  ConnectionStatus,
  useConnectProvider,
} from './useConnectProvider'

export interface InjectedWalletContextT {
  provider: Eip1193Provider
  connect: ConnectFn
  switchChain: (chainId: ChainId) => Promise<void>
  accounts: string[]
  chainId: number | null
  connected: boolean
  connectionStatus: ConnectionStatus
}
const InjectedWalletContext = createContext<InjectedWalletContextT | null>(null)

export const ProvideInjectedWallet = ({ children }: PropsWithChildren) => {
  const {
    provider,
    connect,
    accounts,
    chainId,
    ready,
    switchChain,
    connectionStatus,
  } = useConnectProvider()

  return (
    <InjectedWalletContext.Provider
      value={{
        provider,
        connect,
        accounts,
        chainId,
        connected: ready,
        switchChain,
        connectionStatus,
      }}
    >
      {children}
    </InjectedWalletContext.Provider>
  )
}

export const useInjectedWallet = () => {
  const context = useContext(InjectedWalletContext)

  invariant(
    context != null,
    'useInjectedWalletProvider must be used within a <ProvideInjectedWallet>'
  )

  return context
}
