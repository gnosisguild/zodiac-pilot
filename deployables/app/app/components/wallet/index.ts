import { lazy, type ComponentType } from 'react'
import type { ConnectWalletProps } from './ConnectWallet'
import type { WalletProviderProps } from './WalletProvider'

export const ConnectWallet: ComponentType<ConnectWalletProps> = lazy(
  async () => {
    const { ConnectWallet } = await import('./ConnectWallet')

    return { default: ConnectWallet }
  },
)

export const WalletProvider: ComponentType<WalletProviderProps> = lazy(
  async () => {
    const { WalletProvider } = await import('./WalletProvider')

    return { default: WalletProvider }
  },
)

export { ConnectWalletFallback } from './ConnectWalletFallback'
