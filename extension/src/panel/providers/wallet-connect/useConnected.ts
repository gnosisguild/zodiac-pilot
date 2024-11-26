import { useEffect, useState } from 'react'
import { WalletConnectEthereumMultiProvider } from './WalletConnectEthereumMultiProvider'

export const useConnected = (
  provider: WalletConnectEthereumMultiProvider | null
) => {
  const [connected, setConnected] = useState<boolean | undefined>(
    provider ? provider.connected : undefined
  )

  useEffect(() => {
    if (provider == null) {
      return
    }

    if (connected == null) {
      setConnected(provider.connected)
    }
  }, [connected, provider])

  useEffect(() => {
    if (provider == null) {
      return
    }

    const handleConnectionUpdate = () => {
      setConnected(provider.connected)
    }

    provider.on('connect', handleConnectionUpdate)
    provider.on('disconnect', handleConnectionUpdate)

    const handleAccountsChanged = () => {
      setConnected(provider.connected && provider.accounts.length > 0)
    }

    provider.on('accountsChanged', handleAccountsChanged)

    return () => {
      provider.off('connect', handleConnectionUpdate)
      provider.off('disconnect', handleConnectionUpdate)
      provider.off('accountsChanged', handleAccountsChanged)
    }
  }, [provider])

  return connected === true
}
