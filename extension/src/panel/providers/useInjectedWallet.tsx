import { invariant } from '@epic-web/invariant'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { ChainId } from 'ser-kit'
import { Eip1193Provider } from '../../types'
import { ConnectFn, useConnectProvider } from './useConnectProvider'

export interface InjectedWalletContextT {
  provider: Eip1193Provider
  connect: ConnectFn
  switchChain: (chainId: ChainId) => Promise<void>
  accounts: string[]
  chainId: number | null
  connected: boolean
  connecting: boolean
}
const InjectedWalletContext = createContext<InjectedWalletContextT | null>(null)

export const ProvideInjectedWallet = ({ children }: PropsWithChildren) => {
  const {
    provider,
    connect,
    connecting,
    accounts,
    chainId,
    ready,
    switchChain,
  } = useConnectProvider()

  const packed = useMemo(
    () => ({
      provider,
      connect,
      switchChain,
      accounts,
      chainId,
      connected: ready,
      connecting,
    }),
    [provider, connect, switchChain, accounts, chainId, ready, connecting]
  )

  return (
    <InjectedWalletContext.Provider value={packed}>
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
