import React, { ReactNode, useContext, useMemo } from 'react'
import { ChainId } from 'ser-kit'
import { Eip1193Provider } from '../../types'
import { useConnectProvider } from './useConnectProvider'

export interface InjectedWalletContextT {
  provider: Eip1193Provider
  connect: () => Promise<{ chainId: number; accounts: string[] }>
  switchChain: (chainId: ChainId) => Promise<void>
  accounts: string[]
  chainId: number | null
}
const InjectedWalletContext =
  React.createContext<InjectedWalletContextT | null>(null)

export const ProvideInjectedWallet: React.FC<{
  children: ReactNode
}> = ({ children }) => {
  const { provider, connect, accounts, chainId, ready, switchChain } =
    useConnectProvider()

  const packed = useMemo(
    () => ({
      provider,
      connect,
      switchChain,
      accounts,
      chainId,
    }),
    [provider, connect, switchChain, accounts, chainId]
  )

  if (ready) {
    return (
      <InjectedWalletContext.Provider value={packed}>
        {children}
      </InjectedWalletContext.Provider>
    )
  }

  return null
}

const useInjectedWallet = () => {
  const context = useContext(InjectedWalletContext)
  if (!context) {
    throw new Error(
      'useInjectedWalletProvider must be used within a <ProvideInjectedWallet>'
    )
  }
  return context
}

export default useInjectedWallet
