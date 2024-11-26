import { useEffect, useState } from 'react'
import { WalletConnectEthereumMultiProvider } from './WalletConnectEthereumMultiProvider'

export const useChainId = (
  provider: WalletConnectEthereumMultiProvider | null
) => {
  const [chainId, setChainId] = useState<number | undefined>()

  useEffect(() => {
    if (provider == null) {
      return
    }

    if (chainId == undefined) {
      setChainId(provider.chainId)
    }
  }, [chainId, provider])

  useEffect(() => {
    if (provider == null) {
      return
    }

    const handleChainChanged = () => {
      setChainId(provider.chainId)
    }
    provider.events.on('chainChanged', handleChainChanged)

    return () => {
      provider.events.removeListener('chainChanged', handleChainChanged)
    }
  }, [provider])

  return chainId
}
