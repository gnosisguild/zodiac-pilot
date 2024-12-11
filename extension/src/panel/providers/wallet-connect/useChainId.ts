import { useEffect, useState } from 'react'
import type { ChainId } from 'ser-kit'
import { WalletConnectEthereumMultiProvider } from './WalletConnectEthereumMultiProvider'

export const useChainId = (
  provider: WalletConnectEthereumMultiProvider | null,
) => {
  const [chainId, setChainId] = useState<ChainId | null>(null)

  useEffect(() => {
    if (provider == null) {
      return
    }

    if (chainId == undefined) {
      setChainId(provider.chainId as unknown as ChainId)
    }
  }, [chainId, provider])

  useEffect(() => {
    if (provider == null) {
      return
    }

    const handleChainChanged = () => {
      setChainId(provider.chainId as unknown as ChainId)
    }
    provider.events.on('chainChanged', handleChainChanged)

    return () => {
      provider.events.removeListener('chainChanged', handleChainChanged)
    }
  }, [provider])

  return chainId
}
