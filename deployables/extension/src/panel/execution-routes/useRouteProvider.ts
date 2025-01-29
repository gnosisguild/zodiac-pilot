import { useInjectedWallet } from '@/providers'

export const useRouteProvider = () => {
  const injectedWallet = useInjectedWallet()

  return injectedWallet.provider
}
