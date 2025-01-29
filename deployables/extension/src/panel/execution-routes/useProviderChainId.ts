import { useInjectedWallet } from '@/providers'

/** The chain ID the injected provider is currently connected to. */
export const useProviderChainId = () => {
  const injectedWallet = useInjectedWallet()
  return injectedWallet.chainId
}
