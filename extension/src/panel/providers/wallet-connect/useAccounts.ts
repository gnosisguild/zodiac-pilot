import { useEffect, useState } from 'react'
import { WalletConnectEthereumMultiProvider } from './WalletConnectEthereumMultiProvider'

export const useAccounts = (
  provider: WalletConnectEthereumMultiProvider | null
) => {
  const [accounts, setAccounts] = useState<string[] | undefined>(
    provider ? provider.accounts : undefined
  )

  useEffect(() => {
    if (provider == null) {
      return
    }

    if (accounts == null) {
      setAccounts(provider.accounts)
    }
  }, [accounts, provider])

  useEffect(() => {
    if (provider == null) {
      return
    }

    const handleAccountsChanged = () => {
      setAccounts(provider.accounts)
    }

    provider.events.on('accountsChanged', handleAccountsChanged)

    return () => {
      provider.events.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [provider])

  return accounts || []
}
