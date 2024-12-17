import type { Eip1193Provider } from '@/types'
import { invariant } from '@epic-web/invariant'
import { createContext, type PropsWithChildren, useContext } from 'react'
import type { ChainId } from 'ser-kit'
import type { ConnectionProvider, ConnectionStatus } from '../connectTypes'
import { useConnectProvider } from './useConnectProvider'

export type InjectedWalletContextT = ConnectionProvider & {
  provider: Eip1193Provider | null
  switchChain: (chainId: ChainId) => Promise<void>
  connectionStatus: ConnectionStatus
}
const InjectedWalletContext = createContext<InjectedWalletContextT | null>(null)

export const ProvideInjectedWallet = ({ children }: PropsWithChildren) => {
  return (
    <InjectedWalletContext.Provider value={useConnectProvider()}>
      {children}
    </InjectedWalletContext.Provider>
  )
}

export const useInjectedWallet = () => {
  const context = useContext(InjectedWalletContext)

  invariant(
    context != null,
    'useInjectedWalletProvider must be used within a <ProvideInjectedWallet>',
  )

  return context
}
