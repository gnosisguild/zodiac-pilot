import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getDefaultConfig } from 'connectkit'
import type { PropsWithChildren } from 'react'
import { createConfig, injected, WagmiProvider } from 'wagmi'
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

const wagmiConfig = createConfig(
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
)

export const WalletProvider = ({ children }: PropsWithChildren) => (
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
  </QueryClientProvider>
)
