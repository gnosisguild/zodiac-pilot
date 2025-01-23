import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDefaultConfig } from 'connectkit'
import {
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react'
import { createConfig, injected, WagmiProvider, type Config } from 'wagmi'
import {
  arbitrum,
  avalanche,
  base,
  gnosis,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'

const queryClient = new QueryClient()

const WALLETCONNECT_PROJECT_ID = '0f8a5e2cf60430a26274b421418e8a27'
const isServer = typeof document === 'undefined'

export type WalletProviderProps = PropsWithChildren<{ fallback?: ReactNode }>

export const WalletProvider = ({
  children,
  fallback = null,
}: WalletProviderProps) => {
  const config = useConfig()

  if (config == null) {
    return fallback
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </QueryClientProvider>
  )
}

const useConfig = () => {
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    setConfig(
      createConfig(
        getDefaultConfig({
          appName: 'Zodiac Pilot',
          walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
          chains: [
            mainnet,
            optimism,
            gnosis,
            polygon,
            sepolia,
            base,
            arbitrum,
            avalanche,
          ],
          connectors: isServer
            ? []
            : [
                injected(),
                metaMask(),
                walletConnect({
                  projectId: WALLETCONNECT_PROJECT_ID,
                  showQrModal: false,
                }),
              ],
        }),
      ),
    )
  }, [])

  return config
}
