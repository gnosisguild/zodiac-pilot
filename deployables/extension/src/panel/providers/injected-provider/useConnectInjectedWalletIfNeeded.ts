import { useEffect } from 'react'
import { useInjectedWallet } from './InjectedWalletContext'

export const useConnectInjectedWalletIfNeeded = () => {
  const { chainId, connect, connectionStatus, ready } = useInjectedWallet()

  const mustConnectInjectedWallet =
    !chainId && ready && connectionStatus === 'disconnected'

  // only use computed properties in here
  // otherwise, the effect will synchronize too often and
  // re-trigger the connection which leads to an infinite loop
  useEffect(() => {
    if (mustConnectInjectedWallet) {
      connect()
    }
  }, [connect, mustConnectInjectedWallet])
}
